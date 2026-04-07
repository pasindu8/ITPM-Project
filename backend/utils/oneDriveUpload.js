const axios = require('axios');

let tokenCache = {
    value: '',
    expiresAt: 0
};

const sanitizeFileName = (name) => {
    const base = String(name || 'file')
        .replace(/[^a-zA-Z0-9._-]+/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 120);

    return base || `file_${Date.now()}`;
};

const getConfig = () => {
    const tenantId = process.env.ONEDRIVE_TENANT_ID;
    const clientId = process.env.ONEDRIVE_CLIENT_ID;
    const clientSecret = process.env.ONEDRIVE_CLIENT_SECRET;
    const userId = process.env.ONEDRIVE_USER_ID;
    const driveId = process.env.ONEDRIVE_DRIVE_ID;

    const missing = [];
    if (!tenantId) missing.push('ONEDRIVE_TENANT_ID');
    if (!clientId) missing.push('ONEDRIVE_CLIENT_ID');
    if (!clientSecret) missing.push('ONEDRIVE_CLIENT_SECRET');
    if (!userId && !driveId) missing.push('ONEDRIVE_USER_ID or ONEDRIVE_DRIVE_ID');

    if (missing.length) {
        throw new Error(`OneDrive configuration missing: ${missing.join(', ')}`);
    }

    return {
        tenantId,
        clientId,
        clientSecret,
        userId,
        driveId,
        folder: process.env.ONEDRIVE_FOLDER || 'SmartSport/CourseMaterials'
    };
};

const getAccessToken = async (config) => {
    const now = Date.now();

    if (tokenCache.value && tokenCache.expiresAt > now + 30_000) {
        return tokenCache.value;
    }

    const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: 'https://graph.microsoft.com/.default'
    });

    const response = await axios.post(tokenUrl, body.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    tokenCache = {
        value: response.data.access_token,
        expiresAt: now + Number(response.data.expires_in || 3000) * 1000
    };

    return tokenCache.value;
};

const encodeUploadPath = (folder, fileName) => {
    const cleanedFolder = String(folder || '')
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean);

    const stampedName = `${Date.now()}_${sanitizeFileName(fileName)}`;
    const allParts = [...cleanedFolder, stampedName];

    return allParts.map((part) => encodeURIComponent(part)).join('/');
};

const uploadToOneDrive = async ({ buffer, fileName, mimeType }) => {
    const config = getConfig();
    const token = await getAccessToken(config);
    const encodedPath = encodeUploadPath(config.folder, fileName);

    const uploadUrl = config.driveId
        ? `https://graph.microsoft.com/v1.0/drives/${config.driveId}/root:/${encodedPath}:/content`
        : `https://graph.microsoft.com/v1.0/users/${config.userId}/drive/root:/${encodedPath}:/content`;

    const response = await axios.put(uploadUrl, buffer, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': mimeType || 'application/octet-stream'
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    });

    return {
        itemId: response.data.id,
        fileName: response.data.name,
        fileUrl: response.data.webUrl
    };
};

module.exports = {
    uploadToOneDrive
};
