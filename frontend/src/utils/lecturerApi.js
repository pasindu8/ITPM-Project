const API_BASE_URL = 'http://localhost:5000/lecturer';

const buildUrl = (path, query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
};

const buildAuthHeaders = () => ({
  Authorization: `${localStorage.getItem('token') || ''}`
});

const buildJsonHeaders = () => ({
  'Content-Type': 'application/json',
  ...buildAuthHeaders()
});

const parseResponse = async (response) => {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.message || 'Request failed';
    throw new Error(message);
  }

  return body;
};

export const lecturerGet = async (path, query) => {
  const response = await fetch(buildUrl(path, query), {
    method: 'GET',
    headers: buildAuthHeaders()
  });

  return parseResponse(response);
};

export const lecturerPost = async (path, payload) => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: buildJsonHeaders(),
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
};

export const lecturerPut = async (path, payload) => {
  const response = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: buildJsonHeaders(),
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
};

export const lecturerDelete = async (path) => {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: buildAuthHeaders()
  });

  return parseResponse(response);
};

export const lecturerPostFormData = async (path, formData) => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData
  });

  return parseResponse(response);
};
