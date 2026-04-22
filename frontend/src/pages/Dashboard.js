import React, { useState, useEffect, useMemo } from 'react';
import { clearAuthStorage } from "../utils/auth";
import bg from "../assets/6903344.jpg";
import axios from 'axios';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Alert,
  Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Grid, Card, CardContent, LinearProgress, Tooltip,
  Divider, Avatar, FormControl, InputLabel, Select, MenuItem,
  Collapse, Paper
} from '@mui/material';
import {
  Upload, Trash2, RefreshCw, Edit2, Download, Calendar,
  Clock, MapPin, BookOpen, User, LayoutDashboard, Table2,
  CalendarDays, Search, X, Layers, GraduationCap,
  FlaskConical, FileText, AlertCircle, CheckCircle2, Info,
  Bell, LogOut, Dumbbell, AlertTriangle,
  Repeat, Target, Zap, BarChart2,
  Timer, Flame, RotateCcw, ChevronDown, ChevronUp,
  SlidersHorizontal, CalendarCheck
} from 'lucide-react';

// ─── Palette & Design Tokens (Matched to CoachDashboard White Frosted Glass) ───
const tokens = {
  bg: 'rgba(255, 255, 255, 0.1)',
  surface: 'rgba(255, 255, 255, 0.1)',
  surfaceStrong: 'rgba(15, 23, 42, 0.88)', // For dialogs/dropdowns so text stays readable
  surfaceHover: 'rgba(255, 255, 255, 0.16)',
  surfaceSubtle: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.2)',
  borderLight: 'rgba(255, 255, 255, 0.25)',
  accent: '#FFFFFF',
  accentText: '#1e3a8a', // text-blue-900 like CoachDashboard View button
  accentSoft: 'rgba(255, 255, 255, 0.15)',
  accentGlow: 'rgba(255, 255, 255, 0.3)',
  blue: '#60A5FA',
  blueSoft: 'rgba(96, 165, 250, 0.2)',
  green: '#4ADE80',
  greenSoft: 'rgba(74, 222, 128, 0.2)',
  amber: '#FACC15', // yellow-400 like CoachDashboard Conflict border
  amberSoft: 'rgba(250, 204, 21, 0.2)',
  purple: '#C084FC',
  purpleSoft: 'rgba(192, 132, 252, 0.2)',
  red: '#F87171', // text-red-400 like CoachDashboard Injured Players
  redSoft: 'rgba(248, 113, 113, 0.2)',
  orange: '#FB923C',
  orangeSoft: 'rgba(251, 146, 60, 0.2)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.75)',
  textMuted: 'rgba(255, 255, 255, 0.55)',
  backdropBlur: 'blur(16px)', // backdrop-blur-lg
};

const extTokens = {
  teal: '#2DD4BF',
  tealSoft: 'rgba(45, 212, 191, 0.2)',
  pink: '#F472B6',
  pinkSoft: 'rgba(244, 114, 182, 0.2)',
  indigo: '#818CF8',
  indigoSoft: 'rgba(129, 140, 248, 0.2)',
  cyan: '#22D3EE',
  cyanSoft: 'rgba(34, 211, 238, 0.2)',
};

const dayPalette = {
  Monday:    { bg: 'rgba(96, 165, 250, 0.2)',  accent: '#60A5FA', label: 'Mon' },
  Tuesday:   { bg: 'rgba(74, 222, 128, 0.2)',  accent: '#4ADE80', label: 'Tue' },
  Wednesday: { bg: 'rgba(250, 204, 21, 0.2)',  accent: '#FACC15', label: 'Wed' },
  Thursday:  { bg: 'rgba(192, 132, 252, 0.2)', accent: '#C084FC', label: 'Thu' },
  Friday:    { bg: 'rgba(248, 113, 113, 0.2)', accent: '#F87171', label: 'Fri' },
  Saturday:  { bg: 'rgba(45, 212, 191, 0.2)',  accent: '#2DD4BF', label: 'Sat' },
  Sunday:    { bg: 'rgba(244, 114, 182, 0.2)', accent: '#F472B6', label: 'Sun' },
};

const typeConfig = {
  Lecture:   { icon: BookOpen,     color: tokens.blue,   soft: tokens.blueSoft   },
  Practical: { icon: FlaskConical, color: tokens.green,  soft: tokens.greenSoft  },
  Tutorial:  { icon: FileText,     color: tokens.amber,  soft: tokens.amberSoft  },
  Practice:  { icon: Dumbbell,     color: tokens.orange, soft: tokens.orangeSoft },
};

const PRIORITY_CONFIG = {
  High:   { color: tokens.red,   soft: tokens.redSoft,   icon: Flame,  dot: '#F87171' },
  Medium: { color: tokens.amber, soft: tokens.amberSoft, icon: Zap,    dot: '#FACC15' },
  Low:    { color: tokens.green, soft: tokens.greenSoft, icon: Target, dot: '#4ADE80' },
};

const STATUS_CONFIG = {
  Scheduled:   { color: tokens.blue,  soft: tokens.blueSoft,  icon: CalendarCheck, label: 'Scheduled'   },
  Completed:   { color: tokens.green, soft: tokens.greenSoft, icon: CheckCircle2,  label: 'Completed'   },
  Cancelled:   { color: tokens.red,   soft: tokens.redSoft,   icon: X,             label: 'Cancelled'   },
  Rescheduled: { color: tokens.amber, soft: tokens.amberSoft, icon: RotateCcw,     label: 'Rescheduled' },
};

const SPORT_ICONS = {
  Basketball: '🏀', Swimming: '🏊', Football: '⚽', Tennis: '🎾',
  Cricket: '🏏', Volleyball: '🏐', Athletics: '🏃', Badminton: '🏸',
  Rugby: '🏉', Cycling: '🚴', 'Weight Training': '🏋️', Yoga: '🧘',
  Boxing: '🥊', Other: '🎯',
};

const SPORT_OPTIONS = Object.keys(SPORT_ICONS);

// ─── Shared Glassmorphism Styles (Matched to CoachDashboard rounded-3xl) ───
const glassStyle = {
  bgcolor: tokens.surface,
  backdropFilter: tokens.backdropBlur,
  WebkitBackdropFilter: tokens.backdropBlur,
  border: `1px solid ${tokens.border}`,
  borderRadius: '24px', // rounded-3xl
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
  color: tokens.textPrimary,
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    color: tokens.textPrimary,
    fontSize: '0.875rem',
    backdropFilter: 'blur(8px)',
    '& fieldset': { borderColor: tokens.border },
    '&:hover fieldset': { borderColor: '#FFFFFF' },
    '&.Mui-focused fieldset': { borderColor: '#FFFFFF' },
  },
  '& .MuiInputLabel-root': { color: tokens.textSecondary, fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#FFFFFF' },
  '& .MuiSelect-icon': { color: tokens.textPrimary },
};

const menuPropsSx = {
  PaperProps: {
    sx: {
      bgcolor: tokens.surfaceStrong,
      backdropFilter: 'blur(16px)',
      border: `1px solid ${tokens.border}`,
      borderRadius: '14px',
      color: tokens.textPrimary,
      '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
      '& .MuiMenuItem-root.Mui-selected': { bgcolor: 'rgba(255,255,255,0.2)' },
    }
  }
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function isTimeOverlap(dateA, startA, endA, dateB, startB, endB) {
  if (dateA !== dateB) return false;
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return toMin(startA) < toMin(endB) && toMin(endA) > toMin(startB);
}

function getDurationLabel(start, end) {
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const diff = toMin(end) - toMin(start);
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getTotalHours(practices) {
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const total = practices.reduce((acc, p) => {
    const diff = toMin(p.endTime) - toMin(p.startTime);
    return acc + (diff > 0 ? diff : 0);
  }, 0);
  return (total / 60).toFixed(1);
}

// ─── NavItem (Matched to CoachDashboard White Pill Active Style) ────────────
const NavItem = ({ icon: Icon, label, active, onClick, badge, disabled }) => (
  <Box
    onClick={disabled ? undefined : onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.8,
      px: 2.2,
      py: 1.4,
      cursor: disabled ? 'not-allowed' : 'pointer',
      borderRadius: '16px',
      mx: 1.5,
      mb: 0.8,
      position: 'relative',
      transition: 'all 0.25s ease',
      opacity: disabled ? 0.4 : 1,
      bgcolor: active ? '#FFFFFF' : 'transparent',
      border: `1px solid ${active ? '#FFFFFF' : 'transparent'}`,
      boxShadow: active ? '0 10px 15px -3px rgba(0,0,0,0.2)' : 'none',
      '&:hover': !disabled ? {
        bgcolor: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)',
        transform: 'translateX(3px)',
      } : {},
    }}
  >
    <Icon
      size={19}
      color={active ? tokens.accentText : '#FFFFFF'}
      strokeWidth={active ? 2.4 : 1.8}
    />

    <Typography sx={{
      fontSize: '0.875rem',
      fontWeight: active ? 700 : 500,
      color: active ? tokens.accentText : '#FFFFFF',
      letterSpacing: '0.01em',
      flex: 1,
    }}>
      {label}
    </Typography>

    {badge !== undefined && badge !== null && (
      <Box sx={{
        bgcolor: active ? tokens.accentText : 'rgba(255,255,255,0.2)',
        color: '#FFFFFF',
        borderRadius: '8px',
        px: 1,
        py: 0.2,
        fontSize: '0.7rem',
        fontWeight: 800,
      }}>
        {badge}
      </Box>
    )}
  </Box>
);

// ─── StatCard (Matched to CoachDashboard KPI Cards) ─────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <Card sx={{
    ...glassStyle,
    p: 1,
    textAlign: 'center',
    transition: 'transform 0.25s ease',
    '&:hover': { transform: 'scale(1.03)' }
  }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
        <Icon size={16} color={color || '#FFFFFF'} strokeWidth={2.2} />
        <Typography sx={{
          fontSize: '0.8rem',
          color: tokens.textSecondary,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '2.75rem', fontWeight: 900, color: color || '#FFFFFF', lineHeight: 1.1 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// ═══════════════════════════════════════════════════════════════════════════
// ─── GLOBAL WEEK GRID COMPONENT ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
const GlobalWeekGrid = ({ data }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30'];

  const getTimeSlotIndex = (startTime) => {
    const idx = timeSlots.findIndex(slot => slot === startTime);
    return idx !== -1 ? idx : 0;
  };

  const groupedData = useMemo(() => {
    const grid = {};
    days.forEach(day => { grid[day] = {}; });
    data.forEach(item => {
      const dayIndex = days.indexOf(item.day);
      if (dayIndex === -1) return;
      const slotIndex = getTimeSlotIndex(item.startTime);
      if (!grid[item.day][slotIndex]) grid[item.day][slotIndex] = [];
      grid[item.day][slotIndex].push(item);
    });
    for (const day of days) {
      for (const slot in grid[day]) {
        grid[day][slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
    }
    return grid;
  }, [data]);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Lecture': return { color: tokens.blue, soft: tokens.blueSoft };
      case 'Practice': return { color: tokens.orange, soft: tokens.orangeSoft };
      case 'Exam': return { color: tokens.red, soft: tokens.redSoft };
      case 'Assignment': return { color: tokens.amber, soft: tokens.amberSoft };
      default: return { color: '#FFFFFF', soft: 'rgba(255,255,255,0.12)' };
    }
  };

  const getTypeLabel = (type) => type || 'Event';

  return (
    <Box sx={{ width: '100%', mt: 2, overflowX: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          ...glassStyle,
          minWidth: 1000,
          overflow: 'hidden',
          p: 0,
        }}
      >
        {/* Header Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `90px repeat(7, 1fr)`, bgcolor: 'rgba(255,255,255,0.08)' }}>
          <Box sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: `1px solid ${tokens.border}`
          }}>
            <Clock size={16} color="#FFFFFF" />
          </Box>
          {days.map(day => {
            const dp = dayPalette[day] || dayPalette.Monday;
            return (
              <Box key={day} sx={{
                p: 2,
                textAlign: 'center',
                borderLeft: `1px solid ${tokens.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5
              }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {day.slice(0, 3)}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: dp.accent }}>
                  {day}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Time Grid Rows */}
        {timeSlots.map((time, rowIdx) => (
          <Box key={time} sx={{
            display: 'grid',
            gridTemplateColumns: `90px repeat(7, 1fr)`,
            borderTop: `1px solid ${tokens.border}`,
            minHeight: 110,
            transition: 'background 0.2s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
          }}>
            {/* Time Label Column */}
            <Box sx={{
              p: 2,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRight: `1px solid ${tokens.border}`
            }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 700 }}>
                {time}
              </Typography>
            </Box>

            {/* Day Columns */}
            {days.map(day => {
              const itemsInCell = groupedData[day]?.[rowIdx] || [];
              const cellHasConflict = itemsInCell.some(item => item.conflicts && item.conflicts.length > 0);

              return (
                <Box key={day} sx={{
                  p: 1.2,
                  borderLeft: `1px solid ${tokens.border}`,
                  bgcolor: cellHasConflict ? 'rgba(248, 113, 113, 0.12)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  {itemsInCell.map((item, idx) => {
                    const style = getTypeStyle(item.type);
                    const hasItemConflict = item.conflicts && item.conflicts.length > 0;

                    return (
                      <Tooltip
                        key={idx}
                        title={hasItemConflict ? `CONFLICT: ${item.conflicts.map(c => `${c.type} "${c.title}"`).join(', ')}` : `${item.type}: ${item.title}`}
                        arrow
                        PaperProps={{ sx: { bgcolor: hasItemConflict ? '#991b1b' : tokens.surfaceStrong, border: `1px solid ${tokens.border}` } }}
                      >
                        <Box sx={{
                          p: 1.5,
                          borderRadius: '14px',
                          bgcolor: hasItemConflict ? 'rgba(248, 113, 113, 0.25)' : style.soft,
                          border: `1px solid ${hasItemConflict ? tokens.red : 'rgba(255,255,255,0.15)'}`,
                          borderLeft: `4px solid ${hasItemConflict ? tokens.red : style.color}`,
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            bgcolor: hasItemConflict ? 'rgba(248, 113, 113, 0.35)' : 'rgba(255,255,255,0.2)',
                          }
                        }}>
                          {hasItemConflict && (
                            <Box sx={{ position: 'absolute', top: -6, right: -6, bgcolor: '#ef4444', borderRadius: '50%', p: 0.4, display: 'flex' }}>
                              <AlertTriangle size={10} color="#fff" />
                            </Box>
                          )}

                          <Typography sx={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            lineHeight: 1.25,
                            mb: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {item.title}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              color: hasItemConflict ? '#fecaca' : style.color,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {getTypeLabel(item.type)}
                            </Typography>
                            <Typography sx={{ fontSize: '0.62rem', color: tokens.textSecondary, fontWeight: 600 }}>
                              {item.startTime}
                            </Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        ))}
      </Paper>

      {/* Legend / Footer */}
      <Box sx={{ mt: 2, display: 'flex', gap: 3, px: 1, flexWrap: 'wrap' }}>
        {[
          { label: 'Lecture', color: tokens.blue },
          { label: 'Practice', color: tokens.orange },
          { label: 'Exam', color: tokens.red },
          { label: 'Assignment', color: tokens.amber }
        ].map(type => (
          <Box key={type.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: type.color }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.textSecondary, textTransform: 'uppercase' }}>
              {type.label}
            </Typography>
          </Box>
        ))}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={14} color={tokens.amber} />
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.amber }}>Schedule Conflict detected</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN DASHBOARD COMPONENT ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
const TimetableDashboard = () => {
  const [section, setSection] = useState('upload');
  const [viewMode, setViewMode] = useState('table');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timetableData, setTimetableData] = useState([]);
  const [practices, setPractices] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, entry: null, type: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null, type: null });
  const [stats, setStats] = useState({ total: 0, lectures: 0, practicals: 0, tutorials: 0, practices: 0 });
  const [studentId, setStudentId] = useState(localStorage.getItem('studentId') || '');
  const [group, setGroup] = useState('0101');
  const [dragOver, setDragOver] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  const API = 'http://localhost:5000/api/timetable';
  const PRACTICE_API = 'http://localhost:5000/api/practices';
  const CONFLICT_API = 'http://localhost:5000/api/conflicts';

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fetchTimetable = async () => {
    try {
      const res = await axios.get(`${API}?studentId=${studentId}`);
      setTimetableData(res.data.data);
      calcStats(res.data.data, practices);
      localStorage.setItem('studentId', studentId);
    } catch { showSnackbar('Error fetching timetable', 'error'); }
  };

  const loadPractices = async () => {
    try {
      const res = await axios.get(PRACTICE_API);
      setPractices(res.data.data || []);
    } catch (error) {
      console.error('Failed to load practices:', error);
      showSnackbar('Error loading practices', 'error');
      setPractices([]);
    }
  };

  useEffect(() => {
    const loadStudentData = async () => {
      if (studentId) {
        fetchTimetable();
        loadPractices();
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/auth/profile', {
          headers: { Authorization: localStorage.getItem('token') || '' }
        });
        const profile = res.data;

        if (profile.studentId) {
          localStorage.setItem('studentId', profile.studentId);
          setStudentId(profile.studentId);
        }
        if (profile.sport) {
          localStorage.setItem('sport', profile.sport);
        }
        loadPractices();
      } catch {
        showSnackbar('Unable to load your student profile', 'error');
      }
    };

    loadStudentData();
  }, [studentId]);

  const calcStats = (tt, pr) => {
    setStats({
      total: tt.length,
      lectures: tt.filter(i => i.type === 'Lecture').length,
      practicals: tt.filter(i => i.type === 'Practical').length,
      tutorials: tt.filter(i => i.type === 'Tutorial').length,
      practices: pr.length,
    });
  };

  useEffect(() => {
    calcStats(timetableData, practices);
  }, [practices, timetableData]);

  useEffect(() => {
    let d = timetableData;
    if (selectedDay !== 'all') d = d.filter(i => i.day === selectedDay);
    if (searchTerm) d = d.filter(i =>
      [i.moduleCode, i.moduleName, i.venue, i.type].some(f =>
        f?.toLowerCase().includes(searchTerm.toLowerCase())));
    setFilteredData(d);
  }, [selectedDay, searchTerm, timetableData]);

  const getEndTimeFromType = (startTime, type) => {
    const durations = { Lecture: '1h', Practical: '2h', Tutorial: '1h' };
    const dur = durations[type] || '1h';
    const [h, m] = startTime.split(':').map(Number);
    let add = 60;
    if (dur === '2h') add = 120;
    const total = h * 60 + m + add;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  };

  const sendConflictRequest = async (practiceId, receiverType, message) => {
    try {
      await axios.post(CONFLICT_API, {
        studentId,
        practiceId,
        receiverType,
        message,
        status: 'pending'
      });
      setPractices(prev => prev.map(p =>
        p.id === practiceId ? { ...p, conflictRequestStatus: 'pending' } : p
      ));
      showSnackbar('Request sent successfully', 'success');
      return true;
    } catch (error) {
      showSnackbar('Failed to send request', 'error');
      return false;
    }
  };

  const handleDeleteTimetable = async (id) => {
    try { await axios.delete(`${API}/${id}`); showSnackbar('Entry deleted'); fetchTimetable(); }
    catch { showSnackbar('Delete failed', 'error'); }
  };

  const handleEditTimetable = async (updatedEntry) => {
    const endTime = getEndTimeFromType(updatedEntry.time, updatedEntry.type);
    for (const p of practices) {
      if (isTimeOverlap(updatedEntry.day, updatedEntry.time, endTime, p.day, p.startTime, p.endTime)) {
        showSnackbar(`Conflict with practice "${p.title}" (${p.startTime}-${p.endTime})`, 'error'); return;
      }
    }
    try {
      await axios.put(`${API}/${updatedEntry._id}`, updatedEntry);
      showSnackbar('Entry updated'); fetchTimetable();
      setEditDialog({ open: false, data: null, type: null });
    } catch { showSnackbar('Update failed', 'error'); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { showSnackbar('Please select an image', 'warning'); return; }
    const data = new FormData();
    data.append('timetable', file); data.append('studentId', studentId); data.append('group', group);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/upload`, data);
      const newEntries = res.data.data;
      let conflictDetected = false;
      for (const entry of newEntries) {
        const end = getEndTimeFromType(entry.time, entry.type);
        for (const p of practices) {
          if (isTimeOverlap(entry.day, entry.time, end, p.day, p.startTime, p.endTime)) {
            showSnackbar(`Conflict: ${entry.moduleCode} overlaps with practice "${p.title}"`, 'warning');
            conflictDetected = true; break;
          }
        }
      }
      if (!conflictDetected) showSnackbar(res.data.message);
      fetchTimetable();
      setFile(null);
      setSection('view');
    } catch (err) { showSnackbar(err.response?.data?.error || 'Upload failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleClearAll = async () => {
    try { await axios.delete(`${API}/clear/all?studentId=${studentId}`); showSnackbar('All entries cleared'); fetchTimetable(); }
    catch { showSnackbar('Failed to clear', 'error'); }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(timetableData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `timetable_${studentId}.json`; a.click();
    URL.revokeObjectURL(url); showSnackbar('Exported successfully');
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30'];

  // ─── SectionHeader (Matched to CoachDashboard Header Card) ────────────────
  const SectionHeader = ({ icon: Icon, title, subtitle, children }) => (
    <Box sx={{
      ...glassStyle,
      p: 3,
      mb: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 44,
          height: 44,
          bgcolor: '#FFFFFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
        }}>
          <Icon size={20} color={tokens.accentText} strokeWidth={2.3} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, mt: 0.3 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {children}
    </Box>
  );

  // ─── UPLOAD SECTION ────────────────────────────────────────────────────────
  const UploadSection = () => {
    const steps = ['Student Info', 'Upload Image', 'Review'];
    const currentStep = !studentId || !group ? 0 : !file ? 1 : 2;
    const filePreviewUrl = file ? URL.createObjectURL(file) : null;

    return (
      <Box>
        <SectionHeader
          icon={Upload}
          title="Upload Timetable"
          subtitle="Scan the timetable image, then review extracted sessions"
        />

        {/* Step Progress Bar */}
        <Box sx={{ ...glassStyle, p: 2.5, mb: 3, display: 'flex', alignItems: 'center' }}>
          {steps.map((label, idx) => {
            const done = idx < currentStep;
            const active = idx === currentStep;
            const stepColor = done ? tokens.green : active ? '#FFFFFF' : tokens.textMuted;

            return (
              <React.Fragment key={label}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: done ? tokens.greenSoft : active ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                      border: `2px solid ${stepColor}`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {done ? (
                      <CheckCircle2 size={15} color={tokens.green} />
                    ) : (
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: active ? tokens.accentText : stepColor }}>
                        {idx + 1}
                      </Typography>
                    )}
                  </Box>
                  <Typography sx={{
                    fontSize: '0.68rem',
                    fontWeight: active ? 700 : 500,
                    color: stepColor,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </Typography>
                </Box>

                {idx < steps.length - 1 && (
                  <Box sx={{
                    flex: 1,
                    height: '2px',
                    mx: 1.5,
                    mb: 2.4,
                    borderRadius: 4,
                    bgcolor: done ? tokens.green : tokens.border,
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </Box>

        <Grid container spacing={2.5}>
          {/* LEFT: Student Info Panel */}
          <Grid item xs={12} md={5}>
            <Box sx={{ ...glassStyle, height: '100%', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FFFFFF' }} />
                <Typography sx={{
                  fontSize: '0.75rem',
                  color: tokens.textSecondary,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  Student Information
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, fontWeight: 600, mb: 0.8, textTransform: 'uppercase' }}>
                    Student ID
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. IT21001122"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, pl: 0.5 }}>
                          <User size={15} color="#FFFFFF" />
                        </Box>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, fontWeight: 600, mb: 0.8, textTransform: 'uppercase' }}>
                    Group
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. 0101"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, pl: 0.5 }}>
                          <Layers size={15} color="#FFFFFF" />
                        </Box>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {studentId && group && (
                <Box sx={{
                  mt: 2.5,
                  p: 1.8,
                  borderRadius: '16px',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${tokens.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}>
                  <Box sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '12px',
                    bgcolor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <GraduationCap size={18} color={tokens.accentText} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
                      {studentId}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary }}>
                      Group {group} · Active Session
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', width: 9, height: 9, borderRadius: '50%', bgcolor: tokens.green }} />
                </Box>
              )}
            </Box>
          </Grid>

          {/* RIGHT: File Drop Zone */}
          <Grid item xs={12} md={7}>
            <Box
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) setFile(f);
              }}
              onClick={() => document.getElementById('file-input-hidden').click()}
              sx={{
                ...glassStyle,
                minHeight: 260,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: 1.5,
                transition: 'all 0.25s ease',
                border: `2px dashed ${dragOver ? '#FFFFFF' : file ? tokens.green : tokens.borderLight}`,
                bgcolor: dragOver ? 'rgba(255,255,255,0.18)' : file ? 'rgba(74, 222, 128, 0.12)' : tokens.surface,
                '&:hover': {
                  borderColor: '#FFFFFF',
                  bgcolor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <input
                id="file-input-hidden"
                type="file"
                accept="image/*"
                hidden
                onChange={e => setFile(e.target.files[0])}
              />

              {file ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2, px: 3, textAlign: 'center' }}>
                  {filePreviewUrl && (
                    <Box sx={{
                      width: 76,
                      height: 76,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `2px solid ${tokens.green}`,
                      mb: 0.5,
                    }}>
                      <img src={filePreviewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  )}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    bgcolor: tokens.greenSoft,
                    border: `1px solid ${tokens.green}`,
                    borderRadius: '12px',
                    px: 2,
                    py: 0.8,
                  }}>
                    <CheckCircle2 size={15} color={tokens.green} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700, maxWidth: 220 }} noWrap>
                      {file.name}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, fontFamily: 'monospace' }}>
                    {(file.size / 1024).toFixed(1)} KB · {file.type.split('/')[1]?.toUpperCase()}
                  </Typography>
                  <Button
                    size="small"
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                    sx={{
                      mt: 0.5,
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      bgcolor: 'rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      px: 2,
                      '&:hover': { bgcolor: tokens.redSoft, color: tokens.red },
                    }}
                    startIcon={<RotateCcw size={13} />}
                  >
                    Replace file
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2, px: 4, textAlign: 'center' }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '18px',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    border: `1px solid ${tokens.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Upload size={24} color="#FFFFFF" strokeWidth={1.8} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 700 }}>
                      {dragOver ? 'Release to upload' : 'Drop your timetable image here'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary, mt: 0.4 }}>
                      or <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 700, textDecoration: 'underline' }}>browse files</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.8, mt: 0.5 }}>
                    {['PNG', 'JPG', 'MAX 5MB'].map(fmt => (
                      <Box key={fmt} sx={{
                        px: 1.3,
                        py: 0.4,
                        borderRadius: '8px',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        border: `1px solid ${tokens.border}`,
                      }}>
                        <Typography sx={{ fontSize: '0.62rem', color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.06em' }}>
                          {fmt}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Action Row */}
          <Grid item xs={12}>
            <Box sx={{
              ...glassStyle,
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  onClick={handleUpload}
                  variant="contained"
                  disabled={loading || !file}
                  startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <Zap size={15} />}
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: tokens.accentText,
                    borderRadius: '14px',
                    px: 3.5,
                    py: 1.2,
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: '#eff6ff' },
                    '&:disabled': { bgcolor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.5)' },
                  }}
                >
                  {loading ? 'Scanning timetable…' : 'Upload & Scan'}
                </Button>

                {file && !loading && (
                  <Button
                    onClick={() => setFile(null)}
                    variant="text"
                    startIcon={<X size={14} />}
                    sx={{
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontSize: '0.82rem',
                      borderRadius: '12px',
                      px: 2,
                      py: 1.2,
                      border: `1px solid ${tokens.border}`,
                      '&:hover': { borderColor: tokens.red, color: tokens.red, bgcolor: tokens.redSoft },
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Box>

              {/* Alert style matched to CoachDashboard Conflict Alert */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                bgcolor: 'rgba(255,255,255,0.08)',
                borderLeft: `4px solid ${tokens.amber}`,
                borderRadius: '14px',
                px: 2,
                py: 1,
              }}>
                <AlertCircle size={15} color={tokens.amber} />
                <Typography sx={{ fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 500 }}>
                  OCR may miss text — review and edit each extracted session
                </Typography>
              </Box>
            </Box>

            {loading && (
              <LinearProgress sx={{
                mt: 1.5,
                borderRadius: 6,
                height: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF', borderRadius: 6 },
              }} />
            )}
          </Grid>

          {/* Info Banner */}
          <Grid item xs={12}>
            <Box sx={{
              ...glassStyle,
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              p: 2.2,
              borderLeft: '4px solid #FFFFFF',
            }}>
              <Info size={16} color="#FFFFFF" />
              <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, lineHeight: 1.6 }}>
                Upload a clear, well-lit image of your university timetable. The AI will automatically extract{' '}
                <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                  module code, name, time, venue,
                </Box>{' '}
                and{' '}
                <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                  session type
                </Box>{' '}
                for every entry.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── PRACTICE SECTION ──────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const PracticeSection = () => {
    const [globalData, setGlobalData] = useState([]);
    const [selectedSport, setSelectedSport] = useState(localStorage.getItem('sport') || 'Rugby');
    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalError, setGlobalError] = useState(null);
    const [practiceViewMode, setPracticeViewMode] = useState('cards');

    const [conflictDialog, setConflictDialog] = useState({
      open: false,
      practice: null,
      conflictItem: null,
      message: '',
      receiverType: 'Lecturer',
      sending: false,
    });

    const [filterDay, setFilterDay] = useState('all');
    const [filterSport, setFilterSport] = useState('all');
    const [practiceSearch, setPracticeSearch] = useState('');
    const [sortBy, setSortBy] = useState('day');
    const [expandedCard, setExpandedCard] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const loadGlobalSchedule = async (sport) => {
      if (!sport) return;
      setGlobalLoading(true);
      setGlobalError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/student/global-schedule?sport=${sport}`);
        const data = res.data.data || [];
        setGlobalData(data);
      } catch (err) {
        console.error('Failed to load global schedule:', err);
        setGlobalError('Failed to load schedule. Please try again.');
        showSnackbar('Error loading global schedule', 'error');
        setGlobalData([]);
      } finally {
        setGlobalLoading(false);
      }
    };

    useEffect(() => {
      loadGlobalSchedule(selectedSport);
    }, [selectedSport]);

    const practicesLocal = useMemo(() => globalData.filter(item => item.type === 'Practice'), [globalData]);
    const uniqueSports = useMemo(() => [...new Set(practicesLocal.map(p => p.sport).filter(Boolean))], [practicesLocal]);
    const conflictCount = useMemo(() => practicesLocal.filter(p => p.conflicts && p.conflicts.length > 0).length, [practicesLocal]);

    const filteredPractices = useMemo(() => {
      let list = [...practicesLocal];
      if (filterDay !== 'all') list = list.filter(p => p.day === filterDay);
      if (filterSport !== 'all') list = list.filter(p => p.sport === filterSport);
      if (practiceSearch) list = list.filter(p =>
        [p.title, p.sport, p.location, p.coach].some(f => f?.toLowerCase().includes(practiceSearch.toLowerCase()))
      );
      const ORDER_DAY = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 };
      if (sortBy === 'day') list.sort((a, b) => (ORDER_DAY[a.day] ?? 7) - (ORDER_DAY[b.day] ?? 7) || a.startTime.localeCompare(b.startTime));
      if (sortBy === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
      if (sortBy === 'duration') list.sort((a, b) => {
        const dur = p => { const toM = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; }; return toM(p.endTime) - toM(p.startTime); };
        return dur(b) - dur(a);
      });
      return list;
    }, [practicesLocal, filterDay, filterSport, practiceSearch, sortBy]);

    const practicesByDay = useMemo(() => {
      const grouped = {};
      allDays.forEach(day => { grouped[day] = []; });
      filteredPractices.forEach(p => { if (grouped[p.day]) grouped[p.day].push(p); });
      return grouped;
    }, [filteredPractices]);

    const analytics = useMemo(() => {
      const byDay = allDays.map(d => ({ day: d, count: practicesLocal.filter(p => p.day === d).length }));
      const bySport = SPORT_OPTIONS.map(s => ({ sport: s, count: practicesLocal.filter(p => p.sport === s).length })).filter(x => x.count > 0);
      const totalHours = getTotalHours(practicesLocal);
      return { byDay, bySport, totalHours };
    }, [practicesLocal]);

    const handleExportPractices = () => {
      const blob = new Blob([JSON.stringify(practicesLocal, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `practices_global_${selectedSport}.json`; a.click();
      URL.revokeObjectURL(url); showSnackbar('Practices exported');
    };

    const openConflictNotify = (practice, conflictItem) => {
      const conflictType = conflictItem.type || 'other';
      const conflictTitle = conflictItem.title || 'Unknown';
      const conflictTime = conflictItem.startTime && conflictItem.endTime ? `${conflictItem.startTime}-${conflictItem.endTime}` : '';
      const autoMsg = `I have a conflict with the practice "${practice.title}" on ${practice.day} at ${practice.startTime}-${practice.endTime} because it overlaps with ${conflictType} "${conflictTitle}"${conflictTime ? ` (${conflictTime})` : ''}. Please advise.`;
      setConflictDialog({
        open: true,
        practice,
        conflictItem,
        message: autoMsg,
        receiverType: 'Lecturer',
        sending: false,
      });
    };

    const handleSendConflictRequest = async () => {
      if (!conflictDialog.practice) return;
      setConflictDialog(prev => ({ ...prev, sending: true }));
      const success = await sendConflictRequest(
        conflictDialog.practice.id,
        conflictDialog.receiverType,
        conflictDialog.message
      );
      setConflictDialog(prev => ({ ...prev, sending: false, open: false }));
      if (success) loadGlobalSchedule(selectedSport);
    };

    const StarRating = ({ value }) => (
      <Box sx={{ display: 'flex', gap: 0.3 }}>
        {[1, 2, 3, 4, 5].map(n => <Box key={n} sx={{ color: n <= (value || 0) ? tokens.amber : tokens.textMuted, fontSize: '1rem' }}>★</Box>)}
      </Box>
    );

    const PracticeCard = ({ p }) => {
      const dp = dayPalette[p.day] || dayPalette.Monday;
      const priCfg = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.Medium;
      const sportEmoji = SPORT_ICONS[p.sport] || '🎯';
      const isExpanded = expandedCard === p.id;
      const requestStatus = p.conflictRequestStatus;
      const hasPendingRequest = requestStatus === 'pending';
      const hasConflicts = p.conflicts && p.conflicts.length > 0;
      const showNotifyButton = hasConflicts && !hasPendingRequest && requestStatus !== 'approved' && requestStatus !== 'rejected';

      return (
        <Card
          sx={{
            ...glassStyle,
            border: `1px solid ${hasConflicts ? tokens.amber : isExpanded ? '#FFFFFF' : tokens.border}`,
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              bgcolor: tokens.surfaceHover,
            }
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '16px',
                  bgcolor: 'rgba(255,255,255,0.14)',
                  border: `1px solid ${tokens.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  flexShrink: 0,
                }}>
                  {sportEmoji}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>
                    {p.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: dp.accent, fontWeight: 700 }}>{p.day}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted }}>•</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary }}>{p.sport || 'Uncategorized'}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                bgcolor: priCfg.soft, border: `1px solid ${priCfg.color}60`,
                borderRadius: '20px', px: 1.2, py: 0.4,
              }}>
                <priCfg.icon size={11} color={priCfg.color} strokeWidth={2.5} />
                <Typography sx={{ fontSize: '0.65rem', color: priCfg.color, fontWeight: 800, textTransform: 'uppercase' }}>
                  {p.priority}
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
              bgcolor: 'rgba(255,255,255,0.08)', p: 1.2, borderRadius: '14px',
              border: `1px solid ${tokens.border}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flex: 1, borderRight: `1px solid ${tokens.border}` }}>
                <Clock size={14} color="#FFFFFF" />
                <Typography sx={{ fontSize: '0.82rem', color: '#FFFFFF', fontFamily: 'monospace', fontWeight: 600 }}>
                  {p.startTime} - {p.endTime}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, pr: 1 }}>
                <Timer size={14} color={tokens.textSecondary} />
                <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, fontWeight: 600 }}>
                  {getDurationLabel(p.startTime, p.endTime)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
              {p.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <MapPin size={14} color={tokens.textSecondary} />
                  <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }} noWrap>{p.location}</Typography>
                </Box>
              )}
              {p.coach && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <User size={14} color={tokens.textSecondary} />
                  <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }} noWrap>{p.coach}</Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: hasConflicts ? 2 : 1 }}>
              {p.recurrence && p.recurrence !== 'None' && (
                <Chip icon={<Repeat size={12} style={{ color: extTokens.teal }} />} label={p.recurrence} size="small" sx={{ bgcolor: extTokens.tealSoft, color: extTokens.teal, fontSize: '0.7rem', fontWeight: 700, height: 26 }} />
              )}
              {requestStatus === 'pending' && (
                <Chip icon={<Bell size={12} style={{ color: tokens.amber }} />} label="Request Sent" size="small" sx={{ bgcolor: tokens.amberSoft, color: tokens.amber, fontSize: '0.7rem', fontWeight: 700, height: 26 }} />
              )}
              {requestStatus === 'approved' && (
                <Chip icon={<CheckCircle2 size={12} style={{ color: tokens.green }} />} label="Approved" size="small" sx={{ bgcolor: tokens.greenSoft, color: tokens.green, fontSize: '0.7rem', fontWeight: 700, height: 26 }} />
              )}
              {requestStatus === 'rejected' && (
                <Chip icon={<X size={12} style={{ color: tokens.red }} />} label="Rejected" size="small" sx={{ bgcolor: tokens.redSoft, color: tokens.red, fontSize: '0.7rem', fontWeight: 700, height: 26 }} />
              )}
            </Box>

            {/* Conflict Warning Area (Matched to CoachDashboard Conflict Alert) */}
            {hasConflicts && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.08)', borderRadius: '14px', borderLeft: `4px solid ${tokens.amber}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <AlertTriangle size={15} color={tokens.amber} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 800 }}>⚠️ Schedule Conflict</Typography>
                </Box>
                <Box sx={{ pl: 3 }}>
                  {p.conflicts.map((conf, idx) => (
                    <Typography key={idx} sx={{ fontSize: '0.75rem', color: tokens.textSecondary }}>
                      <strong style={{ color: '#FFFFFF' }}>{conf.type || 'Event'}:</strong> {conf.title || 'Unknown'} {conf.startTime && `(${conf.startTime}-${conf.endTime})`}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: `1px solid ${tokens.border}` }}>
              <Box>{p.rating > 0 && <StarRating value={p.rating} />}</Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showNotifyButton && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Bell size={13} />}
                    onClick={(e) => { e.stopPropagation(); openConflictNotify(p, p.conflicts[0]); }}
                    sx={{
                      textTransform: 'none', fontSize: '0.78rem', fontWeight: 700,
                      bgcolor: '#FFFFFF', color: tokens.accentText,
                      borderRadius: '12px', px: 2,
                      '&:hover': { bgcolor: '#eff6ff' }
                    }}
                  >
                    Notify
                  </Button>
                )}
                <IconButton
                  size="small"
                  onClick={() => setExpandedCard(isExpanded ? null : p.id)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={isExpanded}>
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${tokens.border}` }}>
                {p.notes ? (
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', color: tokens.textMuted, fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>
                      Instructor Notes
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary, bgcolor: 'rgba(255,255,255,0.06)', p: 1.5, borderRadius: '12px' }}>
                      {p.notes}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted, fontStyle: 'italic', textAlign: 'center' }}>
                    No additional notes provided.
                  </Typography>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      );
    };

    const CalendarView = () => {
      const slotHours = Array.from({ length: 16 }, (_, i) => i + 6);
      return (
        <Box sx={{ ...glassStyle, overflowX: 'auto', p: 0 }}>
          <TableContainer><Table sx={{ minWidth: 900 }}>
            <TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderBottom: `1px solid ${tokens.border}`, py: 1.5, px: 1.5 } }}>
              <TableCell sx={{ minWidth: 65 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#FFFFFF' }}>TIME</Typography></TableCell>
              {allDays.map(d => { const dp = dayPalette[d]; const count = practicesLocal.filter(p => p.day === d).length; return (<TableCell key={d} sx={{ minWidth: 130 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dp.accent }} /><Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: dp.accent }}>{dp.label}</Typography>{count > 0 && <Box sx={{ bgcolor: `${dp.accent}30`, borderRadius: '10px', px: 0.8, fontSize: '0.65rem', color: '#FFFFFF', fontWeight: 700 }}>{count}</Box>}</Box></TableCell>); })}
            </TableRow></TableHead>
            <TableBody>{slotHours.map(hour => { const timeStr = `${hour.toString().padStart(2, '0')}:00`; return (<TableRow key={hour} sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tokens.border}`, py: 0.7, px: 1, verticalAlign: 'top' } }}>
              <TableCell><Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: tokens.textSecondary }}>{timeStr}</Typography></TableCell>
              {allDays.map(day => { const dayPractices = practicesLocal.filter(p => { const sH = parseInt(p.startTime.split(':')[0]); return p.day === day && sH === hour; }); const dp = dayPalette[day]; return (<TableCell key={day}>{dayPractices.map(p => { const hasConflict = p.conflicts && p.conflicts.length > 0; return (<Box key={p.id} sx={{ p: 1, mb: 0.5, borderRadius: '12px', bgcolor: hasConflict ? tokens.redSoft : `${dp.accent}25`, border: `1px solid ${hasConflict ? tokens.red : dp.accent}50`, position: 'relative' }}><Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFFFFF' }}>{p.title}</Typography><Typography sx={{ fontSize: '0.65rem', color: tokens.textSecondary }}>{p.startTime}–{p.endTime}</Typography>{hasConflict && <AlertTriangle size={11} color={tokens.amber} style={{ position: 'absolute', top: 5, right: 5 }} />}</Box>); })}</TableCell>); })}
            </TableRow>); })}
            </TableBody>
          </Table></TableContainer>
        </Box>
      );
    };

    const TableView = () => (
      <Box sx={{ ...glassStyle, overflow: 'hidden' }}>
        <TableContainer><Table>
          <TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderBottom: `1px solid ${tokens.border}`, py: 1.5, px: 2 } }}>{['Title', 'Sport', 'Day & Time', 'Duration', 'Priority', 'Location', 'Coach'].map(h => (<TableCell key={h}><Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</Typography></TableCell>))}</TableRow></TableHead>
          <TableBody>{filteredPractices.length === 0 ? (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Dumbbell size={32} color={tokens.textMuted} /><Typography sx={{ mt: 1, color: tokens.textSecondary }}>No practices match your filters</Typography></TableCell></TableRow>) : filteredPractices.map(p => { const hasConflict = p.conflicts && p.conflicts.length > 0; const dp = dayPalette[p.day] || dayPalette.Monday; const priCfg = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.Medium; const PriIcon = priCfg.icon; return (<TableRow key={p.id} hover sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tokens.border}`, py: 1.4, px: 2, color: '#FFFFFF' }, bgcolor: hasConflict ? 'rgba(248, 113, 113, 0.12)' : 'transparent', '&:hover': { bgcolor: tokens.surfaceHover } }}>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{hasConflict && <Tooltip title={`Conflicts with ${p.conflicts.map(c => c.title).join(', ')}`}><AlertTriangle size={14} color={tokens.amber} /></Tooltip>}<Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.title}</Typography></Box></TableCell>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><span>{SPORT_ICONS[p.sport] || '🎯'}</span><Typography sx={{ fontSize: '0.82rem' }}>{p.sport || '—'}</Typography></Box></TableCell>
            <TableCell><Box><Chip label={p.day} size="small" sx={{ bgcolor: `${dp.accent}28`, color: dp.accent, fontSize: '0.7rem', fontWeight: 700, height: 22, mb: 0.3 }} /><Typography sx={{ fontSize: '0.75rem', color: tokens.textSecondary, fontFamily: 'monospace' }}>{p.startTime} – {p.endTime}</Typography></Box></TableCell>
            <TableCell><Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }}>{getDurationLabel(p.startTime, p.endTime)}</Typography></TableCell>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: priCfg.soft, borderRadius: '8px', px: 1, py: 0.5, width: 'fit-content' }}><PriIcon size={11} color={priCfg.color} /><Typography sx={{ fontSize: '0.7rem', color: priCfg.color, fontWeight: 700 }}>{p.priority}</Typography></Box></TableCell>
            <TableCell><Typography sx={{ fontSize: '0.8rem' }}>{p.location || '—'}</Typography></TableCell>
            <TableCell><Typography sx={{ fontSize: '0.8rem' }}>{p.coach || '—'}</Typography></TableCell>
          </TableRow>); })}</TableBody>
        </Table></TableContainer>
      </Box>
    );

    const AnalyticsPanel = () => {
      const maxCount = Math.max(...analytics.byDay.map(d => d.count), 1);
      return (
        <Box sx={{ ...glassStyle, mb: 3 }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'center', gap: 1 }}><BarChart2 size={18} color="#FFFFFF" /><Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Practice Analytics</Typography></Box>
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}><Box sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '18px', border: `1px solid ${tokens.border}`, textAlign: 'center' }}><Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF' }}>{practicesLocal.length}</Typography><Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary, mt: 0.3, textTransform: 'uppercase', fontWeight: 700 }}>Total Practices</Typography></Box></Grid>
              <Grid item xs={12} sm={6} md={4}><Box sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '18px', border: `1px solid ${tokens.border}`, textAlign: 'center' }}><Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF' }}>{analytics.totalHours}h</Typography><Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary, mt: 0.3, textTransform: 'uppercase', fontWeight: 700 }}>Total Hours / Week</Typography></Box></Grid>
              <Grid item xs={12} sm={6} md={4}><Box sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '18px', border: `1px solid ${tokens.border}`, textAlign: 'center' }}><Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: conflictCount > 0 ? tokens.red : tokens.green }}>{conflictCount}</Typography><Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary, mt: 0.3, textTransform: 'uppercase', fontWeight: 700 }}>Schedule Conflicts</Typography></Box></Grid>
              <Grid item xs={12} md={7}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tokens.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>Sessions by Day</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{analytics.byDay.map(({ day, count }) => { const dp = dayPalette[day] || dayPalette.Monday; const pct = maxCount > 0 ? (count / maxCount) * 100 : 0; return (<Box key={day} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Typography sx={{ fontSize: '0.75rem', color: dp.accent, fontWeight: 700, width: 34 }}>{dp.label}</Typography><Box sx={{ flex: 1, height: 8, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: '4px', overflow: 'hidden' }}><Box sx={{ width: `${pct}%`, height: '100%', bgcolor: dp.accent, borderRadius: '4px' }} /></Box><Typography sx={{ fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 700, width: 18, textAlign: 'right' }}>{count}</Typography></Box>); })}</Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tokens.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>Top Sports</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{analytics.bySport.slice(0, 5).map(({ sport, count }) => (<Box key={sport} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>{SPORT_ICONS[sport] || '🎯'}</span><Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary, flex: 1 }}>{sport}</Typography><Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>{count}</Typography></Box>))}</Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      );
    };

    return (
      <Box>
        <SectionHeader
          icon={Dumbbell}
          title="Global Practice Schedule"
          subtitle={globalLoading ? 'Loading schedule data...' : `${practicesLocal.length} sessions this week · ${conflictCount} schedule conflict${conflictCount !== 1 ? 's' : ''}`}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 165, ...inputSx }}>
              <InputLabel>Select Sport</InputLabel>
              <Select
                value={selectedSport}
                onChange={e => setSelectedSport(e.target.value)}
                label="Select Sport"
                MenuProps={menuPropsSx}
              >
                {SPORT_OPTIONS.map(sport => (
                  <MenuItem key={sport} value={sport}>{SPORT_ICONS[sport]} {sport}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              onClick={() => setShowAnalytics(!showAnalytics)}
              startIcon={<BarChart2 size={16} />}
              sx={{
                textTransform: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '14px', px: 2.2, py: 1,
                bgcolor: showAnalytics ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
                color: showAnalytics ? tokens.accentText : '#FFFFFF',
                border: `1px solid ${tokens.border}`,
                '&:hover': { bgcolor: showAnalytics ? '#eff6ff' : 'rgba(255,255,255,0.2)' }
              }}
            >
              Analytics
            </Button>
            <Button
              onClick={handleExportPractices}
              startIcon={<Download size={16} />}
              sx={{
                textTransform: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '14px', px: 2.2, py: 1,
                bgcolor: '#FFFFFF', color: tokens.accentText,
                '&:hover': { bgcolor: '#eff6ff' }
              }}
            >
              Export
            </Button>
          </Box>
        </SectionHeader>

        {globalError && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: tokens.surfaceStrong, color: tokens.red, borderRadius: '16px', border: `1px solid ${tokens.red}` }}>
            {globalError}
          </Alert>
        )}
        {globalLoading && (
          <LinearProgress sx={{ mb: 3, borderRadius: 4, height: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF' } }} />
        )}
        {conflictCount > 0 && (
          <Box sx={{ ...glassStyle, mb: 3, p: 2.5, borderLeft: `4px solid ${tokens.amber}`, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AlertTriangle size={22} color={tokens.amber} />
            <Typography sx={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>
              <strong>⚠️ {conflictCount} practice{conflictCount !== 1 ? 's' : ''}</strong> conflict with your timetable. Review the marked items below and use the “Notify” button to alert your coach or lecturer.
            </Typography>
          </Box>
        )}

        {showAnalytics && <AnalyticsPanel />}

        {/* Toolbar */}
        <Box sx={{ ...glassStyle, display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', p: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} color="#FFFFFF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <TextField fullWidth size="small" placeholder="Search title, sport, location, coach…" value={practiceSearch} onChange={e => setPracticeSearch(e.target.value)} sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], pl: 5, bgcolor: 'transparent', '& fieldset': { border: 'none' } } }} />
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderColor: tokens.border }} />

          <Button onClick={() => setShowFilters(!showFilters)} startIcon={<SlidersHorizontal size={14} />} sx={{ textTransform: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '12px', px: 2, bgcolor: showFilters ? '#FFFFFF' : 'transparent', color: showFilters ? tokens.accentText : '#FFFFFF' }}>
            Filters {(filterDay !== 'all' || filterSport !== 'all') ? '●' : ''}
          </Button>

          <FormControl size="small" sx={{ minWidth: 145, ...inputSx }}>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} displayEmpty MenuProps={menuPropsSx} sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', bgcolor: 'transparent', '& fieldset': { border: 'none' } }}>
              <MenuItem value="day">Sort by Day</MenuItem>
              <MenuItem value="duration">Sort by Duration</MenuItem>
              <MenuItem value="title">Sort by Title</MenuItem>
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem sx={{ borderColor: tokens.border }} />

          <Box sx={{ display: 'flex', p: 0.5, gap: 0.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }}>
            {[{ v: 'cards', icon: LayoutDashboard, tip: 'Cards' }, { v: 'table', icon: Table2, tip: 'Table' }, { v: 'calendar', icon: CalendarDays, tip: 'Calendar' }, { v: 'week', icon: Calendar, tip: 'Week Grid' }].map(({ v, icon: Icon, tip }) => (
              <Tooltip key={v} title={tip}>
                <IconButton size="small" onClick={() => setPracticeViewMode(v)} sx={{ p: 1, borderRadius: '10px', bgcolor: practiceViewMode === v ? '#FFFFFF' : 'transparent', color: practiceViewMode === v ? tokens.accentText : '#FFFFFF', '&:hover': { bgcolor: practiceViewMode === v ? '#FFFFFF' : 'rgba(255,255,255,0.15)' } }}>
                  <Icon size={16} strokeWidth={2.2} />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ ...glassStyle, p: 2.5, mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, fontWeight: 800, textTransform: 'uppercase', mb: 1.2 }}>Filter by Day</Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {['all', ...allDays].map(d => {
                  const dp = dayPalette[d];
                  const isActive = filterDay === d;
                  return (
                    <Chip key={d} label={d === 'all' ? 'All Days' : dp?.label} onClick={() => setFilterDay(d)} sx={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, height: 28, bgcolor: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.1)', color: isActive ? tokens.accentText : '#FFFFFF', border: `1px solid ${tokens.border}` }} />
                  );
                })}
              </Box>
            </Box>
            {uniqueSports.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, fontWeight: 800, textTransform: 'uppercase', mb: 1.2 }}>Filter by Sport</Typography>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  <Chip label="All Sports" onClick={() => setFilterSport('all')} sx={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, height: 28, bgcolor: filterSport === 'all' ? '#FFFFFF' : 'rgba(255,255,255,0.1)', color: filterSport === 'all' ? tokens.accentText : '#FFFFFF' }} />
                  {uniqueSports.map(s => (
                    <Chip key={s} label={`${SPORT_ICONS[s] || '🎯'} ${s}`} onClick={() => setFilterSport(s)} sx={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, height: 28, bgcolor: filterSport === s ? '#FFFFFF' : 'rgba(255,255,255,0.1)', color: filterSport === s ? tokens.accentText : '#FFFFFF' }} />
                  ))}
                </Box>
              </Box>
            )}
            {(filterDay !== 'all' || filterSport !== 'all') && (
              <Button size="small" onClick={() => { setFilterDay('all'); setFilterSport('all'); }} sx={{ textTransform: 'none', color: tokens.red, fontSize: '0.8rem', fontWeight: 700, ml: 'auto' }}>
                Clear Filters
              </Button>
            )}
          </Box>
        </Collapse>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.textSecondary, fontWeight: 500 }}>Showing <strong style={{ color: '#FFFFFF' }}>{filteredPractices.length}</strong> of {practicesLocal.length} practices</Typography>
          {filteredPractices.length === 0 && practicesLocal.length > 0 && (<Button size="small" onClick={() => { setPracticeSearch(''); setFilterDay('all'); setFilterSport('all'); }} sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Reset all filters</Button>)}
        </Box>

        {practicesLocal.length === 0 && !globalLoading && (
          <Box sx={{ ...glassStyle, py: 8, textAlign: 'center' }}>
            <Box sx={{ fontSize: '3.5rem', mb: 1.5 }}>🏋️</Box>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, mb: 0.5, color: '#FFFFFF' }}>No practices scheduled for {selectedSport}</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: tokens.textSecondary }}>Try selecting a different sport or check back later.</Typography>
          </Box>
        )}

        {practicesLocal.length > 0 && practiceViewMode === 'cards' && (
          <Box>
            {allDays.map(day => {
              const dayPractices = practicesByDay[day] || [];
              if (dayPractices.length === 0) return null;
              const dp = dayPalette[day];
              return (
                <Box key={day} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 1, borderBottom: `1px solid ${tokens.border}` }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dp.accent }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>{day}</Typography>
                    <Chip label={`${dayPractices.length} session${dayPractices.length !== 1 ? 's' : ''}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem', height: 24 }} />
                  </Box>
                  <Grid container spacing={2.5}>
                    {dayPractices.map(p => (<Grid item xs={12} sm={6} lg={4} key={p.id}><PracticeCard p={p} /></Grid>))}
                  </Grid>
                </Box>
              );
            })}
          </Box>
        )}
        {practicesLocal.length > 0 && practiceViewMode === 'table' && <TableView />}
        {practicesLocal.length > 0 && practiceViewMode === 'calendar' && <CalendarView />}
        {practicesLocal.length > 0 && practiceViewMode === 'week' && <GlobalWeekGrid data={globalData} />}

        {/* Notify Dialog */}
        <Dialog open={conflictDialog.open} onClose={() => setConflictDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: tokens.surfaceStrong, color: '#FFFFFF', borderRadius: '24px', border: `1px solid ${tokens.border}`, backdropFilter: 'blur(20px)' } }}>
          <DialogTitle sx={{ borderBottom: `1px solid ${tokens.border}`, pb: 2, pt: 3, px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Bell size={20} color={tokens.amber} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>Notify Conflict Concern</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, px: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '14px', border: `1px dashed ${tokens.border}`, mb: 3 }}>
              <Typography sx={{ fontSize: '0.85rem', color: tokens.textSecondary, lineHeight: 1.6 }}>
                Your practice <strong style={{ color: '#FFFFFF' }}>{conflictDialog.practice?.title}</strong> conflicts with <strong style={{ color: '#FFFFFF' }}>{conflictDialog.conflictItem?.type || 'event'}</strong>: <strong style={{ color: '#FFFFFF' }}>{conflictDialog.conflictItem?.title}</strong> at <strong style={{ color: '#FFFFFF' }}>{conflictDialog.conflictItem?.startTime && `${conflictDialog.conflictItem.startTime}-${conflictDialog.conflictItem.endTime}`}</strong>.
              </Typography>
            </Box>
            <TextField fullWidth label="Detailed Message" multiline rows={4} value={conflictDialog.message} onChange={(e) => setConflictDialog(prev => ({ ...prev, message: e.target.value }))} sx={inputSx} margin="normal" />
            <FormControl fullWidth sx={{ ...inputSx, mt: 2 }}>
              <InputLabel>Send to Authority</InputLabel>
              <Select value={conflictDialog.receiverType} onChange={(e) => setConflictDialog(prev => ({ ...prev, receiverType: e.target.value }))} label="Send to Authority" MenuProps={menuPropsSx}>
                <MenuItem value="Lecturer">Lecturer</MenuItem>
                <MenuItem value="Coach">Coach</MenuItem>
                <MenuItem value="Both">Both Authorities</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${tokens.border}` }}>
            <Button onClick={() => setConflictDialog(prev => ({ ...prev, open: false }))} sx={{ color: tokens.textSecondary, fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
            <Button onClick={handleSendConflictRequest} variant="contained" disabled={conflictDialog.sending} sx={{ bgcolor: '#FFFFFF', color: tokens.accentText, fontWeight: 800, borderRadius: '12px', px: 3, '&:hover': { bgcolor: '#eff6ff' }, textTransform: 'none' }}>
              {conflictDialog.sending ? <CircularProgress size={20} color="inherit" /> : 'Send Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // ─── TimetableSection ──────────────────────────────────────────────────────
  const TimetableSection = () => (
    <Box>
      <SectionHeader icon={Calendar} title="Student Timetable" subtitle={`${filteredData.length} entries · ${studentId}`}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchTimetable} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.12)', border: `1px solid ${tokens.border}`, borderRadius: '12px', color: '#FFFFFF', p: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}><RefreshCw size={16} /></IconButton>
          <IconButton onClick={exportData} size="small" sx={{ bgcolor: '#FFFFFF', borderRadius: '12px', color: tokens.accentText, p: 1, '&:hover': { bgcolor: '#eff6ff' } }}><Download size={16} /></IconButton>
        </Box>
      </SectionHeader>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}><StatCard label="Total" value={stats.total} icon={GraduationCap} color="#FFFFFF" /></Grid>
        <Grid item xs={6} sm={3}><StatCard label="Lectures" value={stats.lectures} icon={BookOpen} color={tokens.blue} /></Grid>
        <Grid item xs={6} sm={3}><StatCard label="Practicals" value={stats.practicals} icon={FlaskConical} color={tokens.green} /></Grid>
        <Grid item xs={6} sm={3}><StatCard label="Tutorials" value={stats.tutorials} icon={FileText} color={tokens.amber} /></Grid>
      </Grid>

      <Box sx={{ ...glassStyle, p: 2, mb: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} color="#FFFFFF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
          <TextField fullWidth size="small" placeholder="Search module, venue…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], pl: 4.8 } }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {['all', ...days].map(d => (
            <Chip key={d} label={d === 'all' ? 'All' : dayPalette[d]?.label} onClick={() => setSelectedDay(d)} size="small" sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', bgcolor: selectedDay === d ? '#FFFFFF' : 'rgba(255,255,255,0.1)', color: selectedDay === d ? tokens.accentText : '#FFFFFF', border: `1px solid ${tokens.border}` }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.08)', border: `1px solid ${tokens.border}`, borderRadius: '14px', p: 0.5, gap: 0.5 }}>
          {[{ mode: 'table', icon: Table2, label: 'Table' }, { mode: 'week', icon: CalendarDays, label: 'Week (old)' }, { mode: 'weekGrid', icon: Calendar, label: 'Week Grid' }].map(({ mode, icon: Icon, label }) => (
            <Button key={mode} onClick={() => setViewMode(mode)} size="small" startIcon={<Icon size={14} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', borderRadius: '10px', px: 1.6, py: 0.7, bgcolor: viewMode === mode ? '#FFFFFF' : 'transparent', color: viewMode === mode ? tokens.accentText : '#FFFFFF' }}>{label}</Button>
          ))}
        </Box>
        {timetableData.length > 0 && (
          <Button onClick={handleClearAll} size="small" startIcon={<Trash2 size={14} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', borderRadius: '12px', color: tokens.red, bgcolor: tokens.redSoft, border: `1px solid ${tokens.red}50`, px: 1.8, py: 0.9, '&:hover': { bgcolor: '#ef4444', color: '#fff' } }}>Clear All</Button>
        )}
      </Box>

      {viewMode === 'table' && (
        <Box sx={{ ...glassStyle, overflow: 'hidden' }}>
          <TableContainer><Table>
            <TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'rgba(255,255,255,0.1)', borderBottom: `1px solid ${tokens.border}`, py: 1.5, px: 2 } }}>{['Day', 'Time', 'Module Code', 'Module Name', 'Type', 'Venue', 'Actions'].map(h => (<TableCell key={h}><Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase' }}>{h}</Typography></TableCell>))}</TableRow></TableHead>
            <TableBody>{filteredData.length > 0 ? filteredData.map((item, idx) => { const dp = dayPalette[item.day] || {}; const tc = typeConfig[item.type] || typeConfig.Lecture; const TypeIcon = tc.icon; return (<TableRow key={item._id || idx} sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tokens.border}`, py: 1.5, px: 2, color: '#FFFFFF' }, '&:hover': { bgcolor: tokens.surfaceHover } }}>
              <TableCell><Chip label={item.day} size="small" sx={{ bgcolor: `${dp.accent}28`, color: dp.accent, fontWeight: 700, border: `1px solid ${dp.accent}50` }} /></TableCell>
              <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}><Clock size={13} /><Typography sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.time}</Typography></Box></TableCell>
              <TableCell><Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontFamily: 'monospace' }}>{item.moduleCode}</Typography></TableCell>
              <TableCell><Typography noWrap sx={{ maxWidth: 200 }}>{item.moduleName}</Typography></TableCell>
              <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: tc.soft, borderRadius: '10px', px: 1.2, py: 0.5, width: 'fit-content' }}><TypeIcon size={12} color={tc.color} /><Typography sx={{ fontSize: '0.72rem', color: tc.color, fontWeight: 700 }}>{item.type}</Typography></Box></TableCell>
              <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}><MapPin size={13} /><Typography>{item.venue}</Typography></Box></TableCell>
              <TableCell><Box sx={{ display: 'flex', gap: 0.8 }}>
                <Tooltip title="Edit"><IconButton size="small" onClick={() => setEditDialog({ open: true, data: { ...item }, type: 'timetable' })} sx={{ bgcolor: '#FFFFFF', color: tokens.accentText, borderRadius: '10px', p: 0.8, '&:hover': { bgcolor: '#eff6ff' } }}><Edit2 size={13} /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, entry: item, type: 'timetable' })} sx={{ bgcolor: tokens.redSoft, color: tokens.red, borderRadius: '10px', p: 0.8, '&:hover': { bgcolor: '#ef4444', color: '#fff' } }}><Trash2 size={13} /></IconButton></Tooltip>
              </Box></TableCell>
            </TableRow>); }) : (<TableRow><TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: '#FFFFFF' }}><GraduationCap size={40} color={tokens.textMuted} /><Typography sx={{ mt: 1, color: tokens.textSecondary }}>No entries found. Upload a timetable image.</Typography></TableCell></TableRow>)}</TableBody>
          </Table></TableContainer>
        </Box>
      )}

      {viewMode === 'week' && (
        <Box sx={{ ...glassStyle, overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}><Table sx={{ minWidth: 900 }}>
            <TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'rgba(255,255,255,0.1)', borderBottom: `1px solid ${tokens.border}`, py: 1.5, px: 1.5 } }}><TableCell sx={{ minWidth: 80 }}><Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>Time</Typography></TableCell>{days.map(d => { const dp = dayPalette[d]; return (<TableCell key={d}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dp.accent }} /><Typography sx={{ fontWeight: 800, color: dp.accent }}>{d}</Typography></Box></TableCell>); })}</TableRow></TableHead>
            <TableBody>{timeSlots.map(time => (<TableRow key={time} sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tokens.border}`, py: 1, px: 1.5 } }}><TableCell><Typography sx={{ fontFamily: 'monospace', color: '#FFFFFF', fontWeight: 600 }}>{time}</Typography></TableCell>{days.map(day => { const entry = timetableData.find(e => e.day === day && e.time === time); const dp = dayPalette[day]; const tc = entry ? (typeConfig[entry.type] || typeConfig.Lecture) : null; const TypeIcon = tc?.icon; return (<TableCell key={`${day}-${time}`}>{entry ? (<Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: `${dp.accent}25`, border: `1px solid ${dp.accent}50`, position: 'relative' }}><Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>{entry.moduleCode}</Typography><Typography sx={{ fontSize: '0.7rem', color: tokens.textSecondary }}>{entry.moduleName}</Typography><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>{TypeIcon && <TypeIcon size={10} color={tc.color} />}<Typography sx={{ fontSize: '0.68rem', color: tc?.color, fontWeight: 700 }}>{entry.type}</Typography></Box><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: tokens.textSecondary }}><MapPin size={10} /><Typography sx={{ fontSize: '0.68rem' }}>{entry.venue}</Typography></Box></Box>) : (<Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted, textAlign: 'center' }}>—</Typography>)}</TableCell>); })}</TableRow>))}</TableBody>
          </Table></TableContainer>
        </Box>
      )}

      {viewMode === 'weekGrid' && (<GlobalWeekGrid data={[...timetableData.map(item => ({ ...item, title: `${item.moduleCode} ${item.moduleName}`, startTime: item.time, endTime: getEndTimeFromType(item.time, item.type), type: item.type })), ...practices]} />)}
    </Box>
  );

  // ─── Root Layout (Matched to CoachDashboard p-4 gap-4 Floating Glass Layout) ───
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      minHeight: '100vh',
      width: '100%',
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      p: 2, // p-4
      gap: 2, // gap-4
      color: '#FFFFFF',
    }}>
      {/* Floating Sidebar (Matched to CoachDashboard bg-white/10 backdrop-blur-lg rounded-3xl) */}
      <Box sx={{
        ...glassStyle,
        width: { xs: '100%', md: 260 },
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        position: { md: 'sticky' },
        top: 16,
        height: { md: 'calc(100vh - 32px)' },
        overflowY: 'auto',
      }}>
        <Box sx={{ px: 3, py: 3, borderBottom: `1px solid ${tokens.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1.2, bgcolor: '#FFFFFF', borderRadius: '14px', display: 'flex' }}>
              <GraduationCap size={20} color={tokens.accentText} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>ScheduleAI</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.textSecondary }}>Timetable Management</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mx: 2, my: 2, p: 1.8, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '18px', border: `1px solid ${tokens.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: '#FFFFFF', color: tokens.accentText, fontWeight: 800, fontSize: '0.9rem' }}>
              {studentId ? studentId.slice(-2) : 'ST'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }} noWrap>{studentId || 'Student'}</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary }}>Group {group}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: tokens.border, mx: 2, mb: 1.5 }} />
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', px: 3.5, pb: 1 }}>
          Navigation
        </Typography>

        <Box sx={{ flex: 1 }}>
          <NavItem icon={Upload} label="Upload Timetable" active={section === 'upload'} onClick={() => setSection('upload')} />
          <NavItem icon={Dumbbell} label="Practice Scheduling" active={section === 'practice'} onClick={() => setSection('practice')} />
          <NavItem icon={CalendarDays} label="Student Timetable" active={section === 'view'} onClick={() => setSection('view')} badge={timetableData.length} />
        </Box>

        <Box sx={{ borderTop: `1px solid ${tokens.border}`, pt: 1.5, pb: 2 }}>
          <NavItem icon={LogOut} label="Logout" onClick={() => setLogoutDialog(true)} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {section === 'upload' && <UploadSection />}
        {section === 'practice' && <PracticeSection />}
        {section === 'view' && <TimetableSection />}
      </Box>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })} PaperProps={{ sx: { bgcolor: tokens.surfaceStrong, color: '#FFFFFF', borderRadius: '24px', backdropFilter: 'blur(16px)', border: `1px solid ${tokens.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ color: tokens.textSecondary }}>Are you sure you want to delete this {deleteDialog.type === 'practice' ? 'practice' : 'timetable entry'}?</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false })} sx={{ color: tokens.textSecondary, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={() => { if (deleteDialog.type === 'practice') { showSnackbar('Practices can only be deleted by coaches', 'error'); } else { handleDeleteTimetable(deleteDialog.entry._id); } setDeleteDialog({ open: false }); }} variant="contained" color="error" sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open && editDialog.type === 'timetable'} onClose={() => setEditDialog({ open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: tokens.surfaceStrong, color: '#FFFFFF', borderRadius: '24px', backdropFilter: 'blur(16px)', border: `1px solid ${tokens.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Timetable Entry</DialogTitle>
        <DialogContent>
          {editDialog.data && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {[{ key: 'day', label: 'Day', xs: 6 }, { key: 'time', label: 'Time', xs: 6 }, { key: 'moduleCode', label: 'Module Code', xs: 6 }, { key: 'type', label: 'Type', xs: 6 }, { key: 'moduleName', label: 'Module Name', xs: 12 }, { key: 'venue', label: 'Venue', xs: 12 }].map(({ key, label, xs }) => (
                <Grid item xs={xs} key={key}>
                  <TextField fullWidth label={label} value={editDialog.data[key] || ''} onChange={e => setEditDialog({ ...editDialog, data: { ...editDialog.data, [key]: e.target.value } })} sx={inputSx} size="small" />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialog({ open: false })} sx={{ color: tokens.textSecondary, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={() => handleEditTimetable(editDialog.data)} variant="contained" sx={{ bgcolor: '#FFFFFF', color: tokens.accentText, fontWeight: 800, borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#eff6ff' } }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)} PaperProps={{ sx: { bgcolor: tokens.surfaceStrong, color: '#FFFFFF', borderRadius: '24px', backdropFilter: 'blur(16px)', border: `1px solid ${tokens.border}` } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LogOut size={18} color={tokens.red} />
            <Typography sx={{ fontWeight: 700 }}>Logout</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: tokens.textSecondary }}>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLogoutDialog(false)} sx={{ color: tokens.textSecondary, textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={() => {
              clearAuthStorage();
              window.location.href = '/login';
            }}
            variant="contained"
            sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, textTransform: 'none', borderRadius: '12px', fontWeight: 700 }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ bgcolor: tokens.surfaceStrong, color: '#FFFFFF', border: `1px solid ${tokens.border}`, backdropFilter: 'blur(12px)', borderRadius: '14px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimetableDashboard;