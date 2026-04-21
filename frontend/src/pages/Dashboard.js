import React, { useState, useEffect, useMemo } from 'react';
import { clearAuthStorage } from "../utils/auth";
import bg from "../assets/6903344.jpg"; // adjust path if needed
import axios from 'axios';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Alert,
  Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Grid, Card, CardContent, LinearProgress, Tooltip,
  Divider, Avatar, Badge, FormControl, InputLabel, Select, MenuItem,
  Collapse, ToggleButtonGroup, ToggleButton, Tabs, Tab, Paper
} from '@mui/material';
import {
  Upload, Trash2, RefreshCw, Edit2, Download, Calendar,
  Clock, MapPin, BookOpen, User, LayoutDashboard, Table2,
  CalendarDays, Search, X, ChevronRight, Layers, GraduationCap,
  FlaskConical, FileText, AlertCircle, CheckCircle2, Info,
  MoreVertical, Plus, Eye, Settings, Bell, LogOut, Filter,
  ArrowUpDown, TrendingUp, Activity, Dumbbell, AlertTriangle,
  Star, Flag, Repeat, Tag, Target, Zap, Trophy, BarChart2,
  Timer, Flame, RotateCcw, CheckSquare, ChevronDown, ChevronUp,
  PieChart, ListFilter, Archive, Copy, SlidersHorizontal, Heart,
  CalendarCheck, ClipboardList, Moon, Sun, ArrowRight
} from 'lucide-react';

// ─── Palette & Design Tokens (Enhanced Glassmorphism) ─────────────────────
const tokens = {
  bg: 'rgba(0, 0, 0, 0.85)',        // semi-transparent for glass effect
  surface: 'rgba(19, 23, 32, 0.7)',
  surfaceHover: 'rgba(26, 32, 48, 0.8)',
  border: 'rgba(30, 37, 53, 0.6)',
  borderLight: 'rgba(37, 46, 66, 0.6)',
  accent: '#4F8EF7',
  accentSoft: 'rgba(79,142,247,0.15)',
  accentGlow: 'rgba(79,142,247,0.35)',
  green: '#22C55E',
  greenSoft: 'rgba(34,197,94,0.15)',
  amber: '#F59E0B',
  amberSoft: 'rgba(245,158,11,0.15)',
  purple: '#A855F7',
  purpleSoft: 'rgba(168,85,247,0.15)',
  red: '#EF4444',
  redSoft: 'rgba(239,68,68,0.15)',
  orange: '#F97316',
  orangeSoft: 'rgba(249,115,22,0.15)',
  textPrimary: '#F1F5F9',
  textSecondary: '#d9d9d9',
  textMuted: '#b8b8b8',
  backdropBlur: 'blur(16px)',
};

const extTokens = {
  teal: '#14B8A6',
  tealSoft: 'rgba(20,184,166,0.15)',
  pink: '#EC4899',
  pinkSoft: 'rgba(236,72,153,0.15)',
  indigo: '#6366F1',
  indigoSoft: 'rgba(99,102,241,0.15)',
  cyan: '#06B6D4',
  cyanSoft: 'rgba(6,182,212,0.15)',
};

const dayPalette = {
  Monday:    { bg: '#1e3a5f', accent: '#4F8EF7', label: 'Mon' },
  Tuesday:   { bg: '#1a3d2e', accent: '#22C55E', label: 'Tue' },
  Wednesday: { bg: '#3d2a1a', accent: '#F59E0B', label: 'Wed' },
  Thursday:  { bg: '#2e1a3d', accent: '#A855F7', label: 'Thu' },
  Friday:    { bg: '#3d1a1a', accent: '#EF4444', label: 'Fri' },
  Saturday:  { bg: '#1a3d3a', accent: '#14B8A6', label: 'Sat' },
  Sunday:    { bg: '#2e1e3a', accent: '#EC4899', label: 'Sun' },
};

const typeConfig = {
  Lecture:   { icon: BookOpen,     color: tokens.accent,  soft: tokens.accentSoft  },
  Practical: { icon: FlaskConical, color: tokens.green,   soft: tokens.greenSoft   },
  Tutorial:  { icon: FileText,     color: tokens.amber,   soft: tokens.amberSoft   },
  Practice:  { icon: Dumbbell,     color: tokens.orange,  soft: tokens.orangeSoft  },
};

const PRIORITY_CONFIG = {
  High:   { color: tokens.red,         soft: tokens.redSoft,        icon: Flame,        dot: '#EF4444' },
  Medium: { color: tokens.amber,       soft: tokens.amberSoft,      icon: Zap,          dot: '#F59E0B' },
  Low:    { color: tokens.green,       soft: tokens.greenSoft,      icon: Target,       dot: '#22C55E' },
};

const STATUS_CONFIG = {
  Scheduled:   { color: tokens.accent,        soft: tokens.accentSoft,    icon: CalendarCheck, label: 'Scheduled'   },
  Completed:   { color: tokens.green,         soft: tokens.greenSoft,     icon: CheckCircle2,  label: 'Completed'   },
  Cancelled:   { color: tokens.red,           soft: tokens.redSoft,       icon: X,             label: 'Cancelled'   },
  Rescheduled: { color: tokens.amber,         soft: tokens.amberSoft,     icon: RotateCcw,     label: 'Rescheduled' },
};

const SPORT_ICONS = {
  Basketball: '🏀', Swimming: '🏊', Football: '⚽', Tennis: '🎾',
  Cricket: '🏏', Volleyball: '🏐', Athletics: '🏃', Badminton: '🏸',
  Rugby: '🏉', Cycling: '🚴', 'Weight Training': '🏋️', Yoga: '🧘',
  Boxing: '🥊', Other: '🎯',
};

const SPORT_OPTIONS = Object.keys(SPORT_ICONS);
const RECURRENCE_OPTIONS = ['None', 'Weekly', 'Bi-weekly', 'Monthly'];

// ─── Shared Glassmorphism Styles ─────────────────────────────────────────
const glassStyle = {
  bgcolor: tokens.surface,
  backdropFilter: tokens.backdropBlur,
  border: `1px solid ${tokens.border}`,
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    color: tokens.textPrimary,
    fontSize: '0.875rem',
    backdropFilter: 'blur(8px)',
    '& fieldset': { borderColor: tokens.border },
    '&:hover fieldset': { borderColor: tokens.borderLight },
    '&.Mui-focused fieldset': { borderColor: tokens.accent },
  },
  '& .MuiInputLabel-root': { color: tokens.textSecondary, fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: tokens.accent },
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

// ─── NavItem (Glassmorphism) ────────────────────────────────────────────────
// ─── Premium SaaS NavItem ──────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, active, onClick, badge, disabled }) => (
  <Box
    onClick={disabled ? undefined : onClick}
    sx={{
      display: 'flex', 
      alignItems: 'center', 
      gap: 1.8, 
      px: 2.5, 
      py: 1.4,
      cursor: disabled ? 'not-allowed' : 'pointer', 
      borderRadius: '12px',
      mx: 1.5, 
      mb: 0.8, 
      position: 'relative', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: disabled ? 0.4 : 1,
      bgcolor: active ? 'rgba(79, 142, 247, 0.12)' : 'transparent',
      border: `1px solid ${active ? 'rgba(79, 142, 247, 0.2)' : 'transparent'}`,
      '&:hover': !disabled ? { 
        bgcolor: active ? 'rgba(79, 142, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        transform: 'translateX(4px)',
      } : {},
    }}
  >
    {/* Active Glow Indicator */}
    {active && (
      <Box sx={{
        position: 'absolute',
        left: -12,
        width: '4px',
        height: '24px',
        bgcolor: tokens.accent,
        borderRadius: '0 4px 4px 0',
        boxShadow: `0 0 15px ${tokens.accentGlow}`,
      }} />
    )}
    
    <Icon 
      size={20} 
      color={active ? tokens.accent : tokens.textMuted} 
      strokeWidth={active ? 2.5 : 1.8} 
      style={{ transition: 'all 0.3s ease' }}
    />
    
    <Typography sx={{
      fontSize: '0.875rem', 
      fontWeight: active ? 700 : 500,
      color: active ? tokens.textPrimary : tokens.textSecondary,
      letterSpacing: '0.01em', 
      flex: 1,
    }}>
      {label}
    </Typography>

    {badge && (
      <Box sx={{
        bgcolor: tokens.accent, 
        color: '#fff', 
        borderRadius: '6px',
        px: 1, 
        py: 0.2, 
        fontSize: '0.65rem', 
        fontWeight: 800, 
        boxShadow: `0 2px 8px ${tokens.accentGlow}`
      }}>
        {badge}
      </Box>
    )}
  </Box>
);

// ─── StatCard (Glassmorphism) ───────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, soft }) => (
  <Card sx={{ ...glassStyle, position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', borderColor: color } }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: tokens.textSecondary, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Box sx={{ bgcolor: soft, p: 1, borderRadius: '12px' }}>
          <Icon size={16} color={color} strokeWidth={2} />
        </Box>
      </Box>
      <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: tokens.textPrimary, lineHeight: 1 }}>
        {value}
      </Typography>
    </CardContent>
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', bgcolor: soft }}>
      <Box sx={{ width: `${Math.min(Number(value) * 10, 100)}%`, height: '100%', bgcolor: color, transition: 'width 0.8s ease' }} />
    </Box>
  </Card>
);
// ═══════════════════════════════════════════════════════════════════════════
// ─── GLOBAL WEEK GRID COMPONENT (PREMIUM SAAS UI) ───────────────────────────
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
      case 'Lecture': return { color: tokens.accent, soft: tokens.accentSoft };
      case 'Practice': return { color: tokens.orange, soft: tokens.orangeSoft };
      case 'Exam': return { color: tokens.red, soft: tokens.redSoft };
      case 'Assignment': return { color: tokens.amber, soft: tokens.amberSoft };
      default: return { color: tokens.textSecondary, soft: 'rgba(255,255,255,0.05)' };
    }
  };

  const getTypeLabel = (type) => type || 'Event';

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          ...glassStyle, 
          minWidth: 1000, 
          overflow: 'hidden', 
          p: 0, 
          border: `1px solid ${tokens.borderLight}`,
          borderRadius: '20px'
        }}
      >
        {/* Header Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `90px repeat(7, 1fr)`, bgcolor: 'rgba(0,0,0,0.4)' }}>
          <Box sx={{ 
            p: 2.5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRight: `1px solid ${tokens.borderLight}`
          }}>
            <Clock size={16} color={tokens.textMuted} />
          </Box>
          {days.map(day => {
            const dp = dayPalette[day] || dayPalette.Monday;
            return (
              <Box key={day} sx={{ 
                p: 2, 
                textAlign: 'center', 
                borderLeft: `1px solid ${tokens.borderLight}`,
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
            borderTop: `1px solid ${tokens.borderLight}`, 
            minHeight: 110,
            transition: 'background 0.2s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' }
          }}>
            {/* Time Label Column */}
            <Box sx={{ 
              p: 2, 
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.15)', 
              borderRight: `1px solid ${tokens.borderLight}` 
            }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: tokens.textSecondary, fontWeight: 700 }}>
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
                  borderLeft: `1px solid ${tokens.borderLight}`, 
                  bgcolor: cellHasConflict ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
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
                        PaperProps={{ sx: { bgcolor: hasItemConflict ? tokens.red : tokens.surface, border: `1px solid ${tokens.borderLight}` } }}
                      >
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: '12px', 
                          bgcolor: hasItemConflict ? 'rgba(239, 68, 68, 0.15)' : style.soft, 
                          border: `1px solid ${hasItemConflict ? tokens.red : 'transparent'}`,
                          borderLeft: `4px solid ${hasItemConflict ? tokens.red : style.color}`,
                          position: 'relative', 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: hasItemConflict ? `0 4px 12px rgba(239, 68, 68, 0.2)` : 'none',
                          '&:hover': { 
                            transform: 'translateY(-2px)',
                            bgcolor: hasItemConflict ? 'rgba(239, 68, 68, 0.2)' : style.soft,
                            boxShadow: `0 6px 15px rgba(0,0,0,0.2)`
                          } 
                        }}>
                          {hasItemConflict && (
                            <Box sx={{ position: 'absolute', top: -6, right: -6, bgcolor: tokens.red, borderRadius: '50%', p: 0.4, display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                              <AlertTriangle size={10} color="#fff" />
                            </Box>
                          )}
                          
                          <Typography sx={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 800, 
                            color: hasItemConflict ? tokens.red : tokens.textPrimary, 
                            lineHeight: 1.2,
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
                              fontSize: '0.6rem', 
                              fontWeight: 700, 
                              color: hasItemConflict ? tokens.red : style.color,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {getTypeLabel(item.type)}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: tokens.textSecondary, fontWeight: 600 }}>
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
      <Box sx={{ mt: 2, display: 'flex', gap: 3, px: 1 }}>
        {[
          { label: 'Lecture', color: tokens.accent },
          { label: 'Practice', color: tokens.orange },
          { label: 'Exam', color: tokens.red },
          { label: 'Assignment', color: tokens.amber }
        ].map(type => (
          <Box key={type.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: type.color }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: tokens.textSecondary, textTransform: 'uppercase' }}>
              {type.label}
            </Typography>
          </Box>
        ))}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
           <AlertTriangle size={14} color={tokens.red} />
           <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: tokens.red }}>Schedule Conflict detected</Typography>
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
  const [studentId, setStudentId] = useState(localStorage.getItem('studentId') || 'IT21001122');
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

  const checkPracticeConflict = (practice) => {
    for (const tt of timetableData) {
      const ttEnd = getEndTimeFromType(tt.time, tt.type);
      if (isTimeOverlap(tt.day, tt.time, ttEnd, practice.day, practice.startTime, practice.endTime)) {
        return { conflict: true, with: tt };
      }
    }
    return { conflict: false };
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
      fetchTimetable(); setFile(null);
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

  // ─── SectionHeader ────────────────────────────────────────────────────────
  const SectionHeader = ({ icon: Icon, title, subtitle, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, bgcolor: tokens.accentSoft, borderRadius: '12px', backdropFilter: 'blur(8px)' }}><Icon size={18} color={tokens.accent} strokeWidth={2} /></Box>
        <Box>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: '0.75rem', color: tokens.textSecondary }}>{subtitle}</Typography>}
        </Box>
      </Box>
      {children}
    </Box>
  );

  // ─── UPLOAD SECTION (Enhanced Glassmorphism + AI Disclaimer) ──────────────
 // ─── PROFESSIONAL SAAS UPLOAD SECTION ──────────────────────────────────────
// Drop-in replacement for UploadSection inside TimetableDashboard.
// All external state (file, setFile, dragOver, setDragOver, loading,
// handleUpload, studentId, setStudentId, group, setGroup, tokens,
// glassStyle, inputSx, SectionHeader) is consumed from the parent scope
// exactly as before — zero logic changes.
// ────────────────────────────────────────────────────────────────────────────

const UploadSection = () => {
  // ── Step indicator state (local UI only) ──
  const steps = ['Student Info', 'Upload Image', 'Extract'];
  const currentStep = !studentId || !group ? 0 : !file ? 1 : 2;

  // ── Derived file preview ──
  const filePreviewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <Box>
      {/* ── Section Header ── */}
      <SectionHeader
        icon={Upload}
        title="Upload Timetable"
        subtitle="AI-powered schedule extraction from image"
      />

      {/* ── Step Progress Bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          mb: 3.5,
          px: 0.5,
        }}
      >
        {steps.map((label, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          const stepColor = done
            ? tokens.green
            : active
            ? tokens.accent
            : tokens.textMuted;

          return (
            <React.Fragment key={label}>
              {/* Step bubble */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: done
                      ? tokens.greenSoft
                      : active
                      ? tokens.accentSoft
                      : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${stepColor}`,
                    transition: 'all 0.3s ease',
                    boxShadow: active ? `0 0 12px ${tokens.accentGlow}` : 'none',
                  }}
                >
                  {done ? (
                    <CheckCircle2 size={14} color={tokens.green} />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: stepColor,
                        lineHeight: 1,
                      }}
                    >
                      {idx + 1}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: active ? 700 : 500,
                    color: stepColor,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Typography>
              </Box>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: '2px',
                    mx: 1,
                    mb: 2.4,
                    borderRadius: 4,
                    bgcolor: done ? tokens.green : tokens.border,
                    transition: 'background-color 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': active
                      ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '60%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${tokens.accent}, transparent)`,
                          animation: 'shimmer 1.8s infinite',
                        }
                      : {},
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>

      <style>{`
        @keyframes shimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.7; }
          70%  { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>

      {/* ── Main Card Grid ── */}
      <Grid container spacing={2.5}>
        {/* ── LEFT: Student Info Panel ── */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              ...glassStyle,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.purple})`,
                borderRadius: '20px 20px 0 0',
              },
            }}
          >
            <Box sx={{ p: 3 }}>
              {/* Panel Label */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: tokens.accent,
                    boxShadow: `0 0 8px ${tokens.accentGlow}`,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: tokens.textSecondary,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Student Information
                </Typography>
              </Box>

              {/* Fields */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Student ID */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      color: tokens.textMuted,
                      fontWeight: 600,
                      mb: 0.8,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
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
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: 1,
                            pl: 0.5,
                          }}
                        >
                          <User size={14} color={tokens.accent} />
                        </Box>
                      ),
                    }}
                  />
                </Box>

                {/* Group */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      color: tokens.textMuted,
                      fontWeight: 600,
                      mb: 0.8,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
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
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: 1,
                            pl: 0.5,
                          }}
                        >
                          <Layers size={14} color={tokens.accent} />
                        </Box>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Identity Preview Badge */}
              {studentId && group && (
                <Box
                  sx={{
                    mt: 2.5,
                    p: 1.8,
                    borderRadius: '14px',
                    bgcolor: 'rgba(79,142,247,0.08)',
                    border: `1px solid rgba(79,142,247,0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: tokens.accentSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid rgba(79,142,247,0.3)`,
                    }}
                  >
                    <GraduationCap size={16} color={tokens.accent} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: tokens.textPrimary,
                        fontFamily: 'monospace',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {studentId}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        color: tokens.textSecondary,
                      }}
                    >
                      Group {group} · Active Session
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: tokens.green,
                        boxShadow: `0 0 6px ${tokens.green}`,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* ── RIGHT: File Drop Zone ── */}
        <Grid item xs={12} md={7}>
          <Box
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
            onClick={() =>
              document.getElementById('file-input-hidden').click()
            }
            sx={{
              ...glassStyle,
              minHeight: 240,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: 1.5,
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
              border: `2px dashed ${
                dragOver
                  ? tokens.accent
                  : file
                  ? tokens.green
                  : tokens.border
              }`,
              bgcolor: dragOver
                ? 'rgba(79,142,247,0.07)'
                : file
                ? 'rgba(34,197,94,0.06)'
                : tokens.surface,
              '&:hover': {
                border: `2px dashed ${tokens.accent}`,
                bgcolor: 'rgba(79,142,247,0.07)',
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 40px rgba(79,142,247,0.15)`,
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

            {/* Corner accents */}
            {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map(
              corner => (
                <Box
                  key={corner}
                  sx={{
                    position: 'absolute',
                    width: 16,
                    height: 16,
                    ...(corner === 'topLeft' && { top: 10, left: 10, borderTop: `2px solid ${dragOver || file ? (file ? tokens.green : tokens.accent) : tokens.border}`, borderLeft: `2px solid ${dragOver || file ? (file ? tokens.green : tokens.accent) : tokens.border}` }),
                    ...(corner === 'topRight' && { top: 10, right: 10, borderTop: `2px solid ${dragOver || file ? (file ? tokens.green : tokens.accent) : tokens.border}`, borderRight: `2px solid ${dragOver || file ? (file ? tokens.green : tokens.accent) : tokens.border}` }),
                    ...(corner === 'bottomLeft' && { bottom: 10, left: 10, borderBottom: `2px solid ${dragOver || file ? (file ? tokens.green : tokens.accent) : tokens.border}`, borderLeft: `2px solid ${dragOver || file ? (file ? tokens.green : tokens.accent) : tokens.border}` }),
                    ...(corner === 'bottomRight' && { bottom: 10, right: 10, borderBottom: `2px solid ${dragOver || file ? (file ? tokens.green : tokens.accent) : tokens.border}`, borderRight: `2px solid ${dragOver || file ? (file ? tokens.green : tokens.accent) : tokens.border}` }),
                    transition: 'all 0.3s ease',
                  }}
                />
              )
            )}

            {file ? (
              /* ── File selected state ── */
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.2,
                  px: 3,
                  textAlign: 'center',
                }}
              >
                {/* Thumbnail preview */}
                {filePreviewUrl && (
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: `2px solid ${tokens.green}`,
                      boxShadow: `0 0 16px rgba(34,197,94,0.25)`,
                      mb: 0.5,
                    }}
                  >
                    <img
                      src={filePreviewUrl}
                      alt="preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    bgcolor: tokens.greenSoft,
                    border: `1px solid rgba(34,197,94,0.3)`,
                    borderRadius: '10px',
                    px: 1.8,
                    py: 0.8,
                  }}
                >
                  <CheckCircle2 size={14} color={tokens.green} />
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      color: tokens.green,
                      fontWeight: 700,
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: tokens.textMuted,
                    fontFamily: 'monospace',
                  }}
                >
                  {(file.size / 1024).toFixed(1)} KB ·{' '}
                  {file.type.split('/')[1]?.toUpperCase()}
                </Typography>
                <Button
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  sx={{
                    mt: 0.5,
                    color: tokens.textSecondary,
                    textTransform: 'none',
                    fontSize: '0.72rem',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    px: 2,
                    '&:hover': { color: tokens.red, bgcolor: tokens.redSoft },
                  }}
                  startIcon={<RotateCcw size={12} />}
                >
                  Replace file
                </Button>
              </Box>
            ) : (
              /* ── Empty state ── */
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.2,
                  px: 4,
                  textAlign: 'center',
                }}
              >
                {/* Animated upload icon */}
                <Box
                  sx={{
                    position: 'relative',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {dragOver && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        bgcolor: tokens.accentSoft,
                        animation: 'pulse-ring 1.2s infinite',
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      bgcolor: dragOver ? tokens.accentSoft : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${dragOver ? tokens.accent : tokens.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Upload
                      size={22}
                      color={dragOver ? tokens.accent : tokens.textSecondary}
                      strokeWidth={1.5}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      color: dragOver ? tokens.accent : tokens.textSecondary,
                      fontWeight: 600,
                      transition: 'color 0.2s',
                    }}
                  >
                    {dragOver
                      ? 'Release to upload'
                      : 'Drop your timetable image here'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      color: tokens.textMuted,
                      mt: 0.4,
                    }}
                  >
                    or{' '}
                    <Box
                      component="span"
                      sx={{
                        color: tokens.accent,
                        fontWeight: 600,
                        textDecoration: 'underline',
                        textDecorationStyle: 'dotted',
                      }}
                    >
                      browse files
                    </Box>
                  </Typography>
                </Box>

                {/* Format chips */}
                <Box sx={{ display: 'flex', gap: 0.8, mt: 0.5 }}>
                  {['PNG', 'JPG', 'WEBP'].map(fmt => (
                    <Box
                      key={fmt}
                      sx={{
                        px: 1.2,
                        py: 0.3,
                        borderRadius: '6px',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${tokens.border}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.6rem',
                          color: tokens.textMuted,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {fmt}
                      </Typography>
                    </Box>
                  ))}
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.3,
                      borderRadius: '6px',
                      bgcolor: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${tokens.border}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.6rem',
                        color: tokens.textMuted,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                      }}
                    >
                      MAX 10MB
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Grid>

        {/* ── Action Row ── */}
        <Grid item xs={12}>
          <Box
            sx={{
              ...glassStyle,
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {/* Left: CTA + Clear */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {/* Submit — NO <form> wrapper, call handleUpload directly */}
              <Button
                onClick={handleUpload}
                variant="contained"
                disabled={loading || !file}
                startIcon={
                  loading ? (
                    <CircularProgress size={15} color="inherit" />
                  ) : (
                    <Zap size={15} />
                  )
                }
                sx={{
                  bgcolor: tokens.accent,
                  color: '#fff',
                  borderRadius: '12px',
                  px: 3.5,
                  py: 1.2,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  letterSpacing: '0.02em',
                  boxShadow: `0 0 24px ${tokens.accentGlow}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#3b7de8',
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 32px ${tokens.accentGlow}`,
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(79,142,247,0.3)',
                    color: 'rgba(255,255,255,0.5)',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? 'Extracting with AI…' : 'Upload & Extract'}
              </Button>

              {file && !loading && (
                <Button
                  onClick={() => setFile(null)}
                  variant="text"
                  startIcon={<X size={14} />}
                  sx={{
                    color: tokens.textSecondary,
                    textTransform: 'none',
                    fontSize: '0.82rem',
                    borderRadius: '10px',
                    px: 2,
                    py: 1.2,
                    border: `1px solid ${tokens.border}`,
                    '&:hover': {
                      borderColor: tokens.red,
                      color: tokens.red,
                      bgcolor: tokens.redSoft,
                    },
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>

            {/* Right: AI disclaimer */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: tokens.amberSoft,
                border: `1px solid rgba(245,158,11,0.25)`,
                borderRadius: '10px',
                px: 1.8,
                py: 0.9,
              }}
            >
              <AlertCircle size={13} color={tokens.amber} />
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: tokens.amber,
                  fontWeight: 500,
                  fontStyle: 'italic',
                }}
              >
                AI extraction — always verify the results
              </Typography>
            </Box>
          </Box>

          {/* Loading progress bar */}
          {loading && (
            <LinearProgress
              sx={{
                mt: 1.5,
                borderRadius: 6,
                height: 4,
                bgcolor: tokens.border,
                '& .MuiLinearProgress-bar': {
                  bgcolor: tokens.accent,
                  borderRadius: 6,
                },
              }}
            />
          )}
        </Grid>

        {/* ── Info Banner ── */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              p: 2,
              bgcolor: tokens.accentSoft,
              borderRadius: '14px',
              border: `1px solid rgba(79,142,247,0.2)`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box
              sx={{
                mt: 0.2,
                p: 0.8,
                bgcolor: tokens.accentSoft,
                borderRadius: '8px',
                border: `1px solid rgba(79,142,247,0.2)`,
                flexShrink: 0,
              }}
            >
              <Info size={13} color={tokens.accent} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  color: tokens.textSecondary,
                  lineHeight: 1.7,
                }}
              >
                Upload a clear, well-lit image of your university timetable.
                The AI will automatically extract{' '}
                <Box
                  component="span"
                  sx={{ color: tokens.textPrimary, fontWeight: 600 }}
                >
                  module code, name, time, venue,
                </Box>{' '}
                and{' '}
                <Box
                  component="span"
                  sx={{ color: tokens.textPrimary, fontWeight: 600 }}
                >
                  session type
                </Box>{' '}
                for every entry.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── PRACTICE SECTION (Enhanced Realism) ───────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const PracticeSection = () => {
    const [globalData, setGlobalData] = useState([]);
    const [selectedSport, setSelectedSport] = useState('Rugby');
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
        {[1,2,3,4,5].map(n => <Box key={n} sx={{ color: n <= (value || 0) ? tokens.amber : tokens.textMuted, fontSize: '1rem' }}>★</Box>)}
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
        border: `1px solid ${hasConflicts ? tokens.red : isExpanded ? dp.accent : tokens.borderLight}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden', // Keep the ambient glow contained
        position: 'relative',
        bgcolor: tokens.surface,
        '&:hover': {
          border: `1px solid ${hasConflicts ? tokens.red : dp.accent}`,
          transform: 'translateY(-5px)',
          boxShadow: `0 16px 40px -10px ${hasConflicts ? tokens.redSoft : 'rgba(0,0,0,0.5)'}`,
          '& .ambient-glow': { opacity: 0.35 }
        }
      }}
    >
      {/* Ambient background glow based on priority color */}
      <Box
        className="ambient-glow"
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 150,
          height: 150,
          background: `radial-gradient(circle, ${priCfg.color} 0%, transparent 70%)`,
          opacity: 0.15,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Premium Icon Container */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${dp.accent}20 0%, transparent 100%)`,
                border: `1px solid ${dp.accent}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                flexShrink: 0,
                boxShadow: `inset 0 2px 10px ${dp.accent}10`
              }}
            >
              {sportEmoji}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: tokens.textPrimary, letterSpacing: '0.01em' }}>
                {p.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                <Typography sx={{ fontSize: '0.75rem', color: dp.accent, fontWeight: 600 }}>{p.day}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted }}>•</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: tokens.textSecondary }}>{p.sport || 'Uncategorized'}</Typography>
              </Box>
            </Box>
          </Box>
          {/* Priority Pill */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: priCfg.soft, border: `1px solid ${priCfg.color}40`,
              borderRadius: '20px', px: 1.2, py: 0.4,
              boxShadow: `0 2px 10px ${priCfg.soft}`
            }}
          >
            <priCfg.icon size={11} color={priCfg.color} strokeWidth={2.5} />
            <Typography sx={{ fontSize: '0.65rem', color: priCfg.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {p.priority}
            </Typography>
          </Box>
        </Box>

        {/* Time & Duration row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: '12px', border: `1px solid ${tokens.borderLight}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flex: 1, borderRight: `1px solid ${tokens.borderLight}` }}>
            <Clock size={14} color={tokens.textSecondary} />
            <Typography sx={{ fontSize: '0.8rem', color: tokens.textPrimary, fontFamily: 'monospace', fontWeight: 500 }}>
              {p.startTime} - {p.endTime}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, pr: 1 }}>
            <Timer size={14} color={tokens.textSecondary} />
            <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary, fontWeight: 500 }}>
              {getDurationLabel(p.startTime, p.endTime)}
            </Typography>
          </Box>
        </Box>

        {/* Info Grid (Location & Coach) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          {p.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ p: 0.6, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}><MapPin size={13} color={tokens.textSecondary} /></Box>
              <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }} noWrap>{p.location}</Typography>
            </Box>
          )}
          {p.coach && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ p: 0.6, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}><User size={13} color={tokens.textSecondary} /></Box>
              <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }} noWrap>{p.coach}</Typography>
            </Box>
          )}
        </Box>

        {/* Status Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: hasConflicts ? 2 : 1 }}>
          {p.recurrence && p.recurrence !== 'None' && (
            <Chip icon={<Repeat size={12} style={{ color: extTokens.teal }} />} label={p.recurrence} size="small" sx={{ bgcolor: extTokens.tealSoft, color: extTokens.teal, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${extTokens.teal}40`, height: 26 }} />
          )}
          {requestStatus === 'pending' && (
            <Chip icon={<Bell size={12} style={{ color: tokens.amber }} />} label="Request Sent" size="small" sx={{ bgcolor: tokens.amberSoft, color: tokens.amber, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${tokens.amber}40`, height: 26 }} />
          )}
          {requestStatus === 'approved' && (
            <Chip icon={<CheckCircle2 size={12} style={{ color: tokens.green }} />} label="Approved" size="small" sx={{ bgcolor: tokens.greenSoft, color: tokens.green, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${tokens.green}40`, height: 26 }} />
          )}
          {requestStatus === 'rejected' && (
            <Chip icon={<X size={12} style={{ color: tokens.red }} />} label="Rejected" size="small" sx={{ bgcolor: tokens.redSoft, color: tokens.red, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${tokens.red}40`, height: 26 }} />
          )}
        </Box>

        {/* Conflict Warning Area */}
        {hasConflicts && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', borderLeft: `3px solid ${tokens.red}`, borderTop: `1px solid ${tokens.redSoft}`, borderRight: `1px solid ${tokens.redSoft}`, borderBottom: `1px solid ${tokens.redSoft}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AlertTriangle size={15} color={tokens.red} />
              <Typography sx={{ fontSize: '0.75rem', color: tokens.red, fontWeight: 700, letterSpacing: '0.03em' }}>SCHEDULE CONFLICT</Typography>
            </Box>
            <Box sx={{ pl: 3.5 }}>
              {p.conflicts.map((conf, idx) => (
                <Typography key={idx} sx={{ fontSize: '0.75rem', color: tokens.textSecondary, mb: 0.5 }}>
                  <strong style={{ color: tokens.textPrimary }}>{conf.type || 'Event'}:</strong> {conf.title || 'Unknown'} {conf.startTime && `(${conf.startTime}-${conf.endTime})`}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Footer Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: `1px solid ${tokens.borderLight}` }}>
          <Box>
            {p.rating > 0 && <StarRating value={p.rating} />}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showNotifyButton && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Bell size={13} />}
                onClick={(e) => { e.stopPropagation(); openConflictNotify(p, p.conflicts[0]); }}
                sx={{
                  textTransform: 'none', fontSize: '0.75rem', fontWeight: 600,
                  bgcolor: tokens.redSoft, color: tokens.red, boxShadow: 'none',
                  borderRadius: '10px', px: 1.5,
                  '&:hover': { bgcolor: tokens.red, color: '#fff', boxShadow: `0 4px 15px ${tokens.redSoft}` }
                }}
              >
                Notify
              </Button>
            )}
            <IconButton 
              size="small" 
              onClick={() => setExpandedCard(isExpanded ? null : p.id)} 
              sx={{ 
                bgcolor: isExpanded ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', 
                color: isExpanded ? tokens.textPrimary : tokens.textSecondary, 
                borderRadius: '10px',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </IconButton>
          </Box>
        </Box>

        {/* Expandable Notes */}
        <Collapse in={isExpanded}>
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${tokens.borderLight}` }}>
            {p.notes ? (
              <Box sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: '0.65rem', color: tokens.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                  Instructor Notes
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary, lineHeight: 1.5, bgcolor: 'rgba(0,0,0,0.2)', p: 1.5, borderRadius: '10px' }}>
                  {p.notes}
                </Typography>
              </Box>
            ) : (
               <Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted, fontStyle: 'italic', textAlign: 'center', my: 1 }}>
                 No additional notes provided.
               </Typography>
            )}
            {p.createdBy && (
              <Typography sx={{ fontSize: '0.65rem', color: tokens.textMuted, mt: 1.5, textAlign: 'right' }}>
                Added by {p.createdBy}
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
            <TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'rgba(226, 226, 226, 0.3)', borderBottom: `1px solid ${tokens.border}`, py: 1.2, px: 1.5 } }}>
              <TableCell sx={{ minWidth: 60 }}><Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: tokens.textSecondary }}>TIME</Typography></TableCell>
              {allDays.map(d => { const dp = dayPalette[d]; const count = practicesLocal.filter(p => p.day === d).length; return (<TableCell key={d} sx={{ minWidth: 130 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dp.accent }} /><Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: dp.accent }}>{dp.label}</Typography>{count > 0 && <Box sx={{ bgcolor: `${dp.accent}22`, borderRadius: '10px', px: 0.7, fontSize: '0.6rem', color: dp.accent, fontWeight: 700 }}>{count}</Box>}</Box></TableCell>); })}
            </TableRow></TableHead>
            <TableBody>{slotHours.map(hour => { const timeStr = `${hour.toString().padStart(2, '0')}:00`; return (<TableRow key={hour} sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tokens.border}20`, py: 0.5, px: 1, verticalAlign: 'top' } }}>
              <TableCell><Typography sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: tokens.textMuted }}>{timeStr}</Typography></TableCell>
              {allDays.map(day => { const dayPractices = practicesLocal.filter(p => { const sH = parseInt(p.startTime.split(':')[0]); return p.day === day && sH === hour; }); const dp = dayPalette[day]; return (<TableCell key={day}>{dayPractices.map(p => { const hasConflict = p.conflicts && p.conflicts.length > 0; return (<Box key={p.id} sx={{ p: 1, mb: 0.5, borderRadius: '10px', bgcolor: hasConflict ? tokens.redSoft : `${dp.accent}15`, border: `1px solid ${hasConflict ? tokens.red : dp.accent}30`, position: 'relative' }}><Box sx={{ position: 'absolute', top: 0, left: 0, width: '3px', bottom: 0, bgcolor: PRIORITY_CONFIG[p.priority]?.color, borderRadius: '10px 0 0 10px' }} /><Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: dp.accent, pl: 0.8 }}>{p.title}</Typography><Typography sx={{ fontSize: '0.62rem', color: tokens.textSecondary, pl: 0.8 }}>{p.startTime}–{p.endTime}</Typography>{hasConflict && <AlertTriangle size={10} color={tokens.red} style={{ position: 'absolute', top: 4, right: 4 }} />}</Box>); })}</TableCell>); })}
            </TableRow>); })}
            </TableBody>
          </Table></TableContainer>
        </Box>
      );
    };

    const TableView = () => (
      <Box sx={glassStyle}>
        <TableContainer><Table>
          <TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'rgba(255, 255, 255, 0.3)', borderBottom: `1px solid ${tokens.border}`, py: 1.3, px: 2 } }}>{['Title','Sport','Day & Time','Duration','Priority','Location','Coach'].map(h => (<TableCell key={h}><Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: tokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</Typography></TableCell>))}</TableRow></TableHead>
          <TableBody>{filteredPractices.length === 0 ? (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Dumbbell size={32} color={tokens.textMuted} /><Typography sx={{ mt: 1, color: tokens.textSecondary }}>No practices match your filters</Typography></TableCell></TableRow>) : filteredPractices.map(p => { const hasConflict = p.conflicts && p.conflicts.length > 0; const dp = dayPalette[p.day] || dayPalette.Monday; const priCfg = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.Medium; const PriIcon = priCfg.icon; return (<TableRow key={p.id} hover sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tokens.border}`, py: 1.2, px: 2 }, bgcolor: hasConflict ? `${tokens.redSoft}80` : 'transparent', '&:hover': { bgcolor: tokens.surfaceHover } }}>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{hasConflict && <Tooltip title={`Conflicts with ${p.conflicts.map(c => c.title).join(', ')}`}><AlertTriangle size={13} color={tokens.red} /></Tooltip>}<Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.title}</Typography></Box></TableCell>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><span>{SPORT_ICONS[p.sport] || '🎯'}</span><Typography sx={{ fontSize: '0.8rem' }}>{p.sport || '—'}</Typography></Box></TableCell>
            <TableCell><Box><Chip label={p.day} size="small" sx={{ bgcolor: `${dp.accent}18`, color: dp.accent, fontSize: '0.68rem', fontWeight: 700, height: 20, mb: 0.3 }} /><Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, fontFamily: 'monospace' }}>{p.startTime} – {p.endTime}</Typography></Box></TableCell>
            <TableCell><Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary }}>{getDurationLabel(p.startTime, p.endTime)}</Typography></TableCell>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: priCfg.soft, borderRadius: '8px', px: 1, py: 0.5, width: 'fit-content' }}><PriIcon size={10} color={priCfg.color} /><Typography sx={{ fontSize: '0.68rem', color: priCfg.color, fontWeight: 700 }}>{p.priority}</Typography></Box></TableCell>
            <TableCell><Typography sx={{ fontSize: '0.78rem' }}>{p.location || '—'}</Typography></TableCell>
            <TableCell><Typography sx={{ fontSize: '0.78rem' }}>{p.coach || '—'}</Typography></TableCell>
          </TableRow>);})}</TableBody>
        </Table></TableContainer>
      </Box>
    );

    const AnalyticsPanel = () => {
      const maxCount = Math.max(...analytics.byDay.map(d => d.count), 1);
      return (
        <Box sx={{ ...glassStyle, mb: 2.5 }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'center', gap: 1 }}><BarChart2 size={16} color={tokens.orange} /><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Practice Analytics</Typography></Box>
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}><Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: `1px solid ${tokens.border}`, textAlign: 'center' }}><Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: tokens.orange }}>{practicesLocal.length}</Typography><Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, mt: 0.3 }}>Total Practices</Typography></Box></Grid>
              <Grid item xs={12} sm={6} md={4}><Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: `1px solid ${tokens.border}`, textAlign: 'center' }}><Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: tokens.orange }}>{analytics.totalHours}h</Typography><Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, mt: 0.3 }}>Total Hours / Week</Typography></Box></Grid>
              <Grid item xs={12} sm={6} md={4}><Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: `1px solid ${tokens.border}`, textAlign: 'center' }}><Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: conflictCount > 0 ? tokens.red : tokens.green }}>{conflictCount}</Typography><Typography sx={{ fontSize: '0.72rem', color: tokens.textSecondary, mt: 0.3 }}>Schedule Conflicts</Typography></Box></Grid>
              <Grid item xs={12} md={7}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>Sessions by Day</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{analytics.byDay.map(({ day, count }) => { const dp = dayPalette[day] || dayPalette.Monday; const pct = maxCount > 0 ? (count / maxCount) * 100 : 0; return (<Box key={day} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Typography sx={{ fontSize: '0.7rem', color: dp.accent, fontWeight: 700, width: 32 }}>{dp.label}</Typography><Box sx={{ flex: 1, height: 8, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}><Box sx={{ width: `${pct}%`, height: '100%', bgcolor: dp.accent, borderRadius: '4px', transition: 'width 0.8s ease' }} /></Box><Typography sx={{ fontSize: '0.7rem', color: tokens.textSecondary, width: 16, textAlign: 'right' }}>{count}</Typography></Box>); })}</Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>Top Sports</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{analytics.bySport.slice(0,5).map(({ sport, count }) => (<Box key={sport} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>{SPORT_ICONS[sport] || '🎯'}</span><Typography sx={{ fontSize: '0.7rem', color: tokens.textSecondary, flex: 1 }}>{sport}</Typography><Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: tokens.textPrimary }}>{count}</Typography></Box>))}</Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      );
    };

    
    return (
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Area */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                p: 1.5, 
                background: `linear-gradient(135deg, ${tokens.orangeSoft} 0%, transparent 100%)`, 
                border: `1px solid ${tokens.orange}30`,
                borderRadius: '16px', 
                boxShadow: `inset 0 2px 10px ${tokens.orange}10`
              }}
            >
              <Dumbbell size={22} color={tokens.orange} strokeWidth={2.5} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.01em', color: tokens.textPrimary }}>
                Global Practice Schedule
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: tokens.textSecondary, fontWeight: 500, mt: 0.3 }}>
                {globalLoading ? 'Loading schedule data...' : `${practicesLocal.length} sessions this week · ${conflictCount} schedule conflict${conflictCount !== 1 ? 's' : ''}`}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 160, ...inputSx }}>
              <InputLabel>Select Sport</InputLabel>
              <Select 
                value={selectedSport} 
                onChange={e => setSelectedSport(e.target.value)} 
                label="Select Sport" 
                sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '12px', '& fieldset': { borderColor: tokens.borderLight } }}
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
                textTransform: 'none', fontSize: '0.85rem', fontWeight: 600, borderRadius: '12px', px: 2, py: 1, 
                bgcolor: showAnalytics ? tokens.orangeSoft : 'rgba(255,255,255,0.03)', 
                color: showAnalytics ? tokens.orange : tokens.textPrimary, 
                border: `1px solid ${showAnalytics ? tokens.orange : tokens.borderLight}`, 
                transition: 'all 0.2s',
                '&:hover': { bgcolor: tokens.orangeSoft, borderColor: tokens.orange, transform: 'translateY(-2px)' } 
              }}
            >
              Analytics
            </Button>
            <Button 
              onClick={handleExportPractices} 
              startIcon={<Download size={16} />} 
              sx={{ 
                textTransform: 'none', fontSize: '0.85rem', fontWeight: 600, borderRadius: '12px', px: 2, py: 1, 
                bgcolor: 'rgba(255,255,255,0.03)', color: tokens.textPrimary, border: `1px solid ${tokens.borderLight}`, 
                transition: 'all 0.2s',
                '&:hover': { bgcolor: tokens.surfaceHover, borderColor: tokens.textSecondary, transform: 'translateY(-2px)' } 
              }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Status Indicators */}
        {globalError && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: tokens.red, borderRadius: '14px', border: `1px solid ${tokens.redSoft}` }}>
            {globalError}
          </Alert>
        )}
        {globalLoading && (
          <LinearProgress sx={{ mb: 3, borderRadius: 4, height: 4, bgcolor: tokens.border, '& .MuiLinearProgress-bar': { bgcolor: tokens.orange } }} />
        )}
        {conflictCount > 0 && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', borderLeft: `4px solid ${tokens.red}`, borderTop: `1px solid ${tokens.redSoft}`, borderRight: `1px solid ${tokens.redSoft}`, borderBottom: `1px solid ${tokens.redSoft}`, display: 'flex', alignItems: 'center', gap: 2, backdropFilter: 'blur(10px)' }}>
            <Box sx={{ p: 1, bgcolor: tokens.redSoft, borderRadius: '10px' }}><AlertTriangle size={20} color={tokens.red} /></Box>
            <Typography sx={{ fontSize: '0.9rem', color: tokens.red, fontWeight: 500, lineHeight: 1.4 }}>
              <strong>{conflictCount} practice{conflictCount !== 1 ? 's' : ''}</strong> conflict with your timetable. Review the marked items below and use the “Notify” button to alert your coach or lecturer.
            </Typography>
          </Box>
        )}

        {showAnalytics && <AnalyticsPanel />}

        {/* Toolbar (Search, Filters, Views) */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: `1px solid ${tokens.borderLight}` }}>
          <Box sx={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} color={tokens.textSecondary} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <TextField fullWidth size="small" placeholder="Search title, sport, location, coach…" value={practiceSearch} onChange={e => setPracticeSearch(e.target.value)} sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], pl: 5, bgcolor: 'transparent', border: 'none', '& fieldset': { border: 'none' } } }} />
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderColor: tokens.borderLight, my: 1 }} />
          
          <Button onClick={() => setShowFilters(!showFilters)} startIcon={<SlidersHorizontal size={14} />} sx={{ textTransform: 'none', fontSize: '0.85rem', fontWeight: 600, borderRadius: '10px', px: 2, bgcolor: showFilters ? tokens.accentSoft : 'transparent', color: showFilters ? tokens.accent : tokens.textSecondary, '&:hover': { bgcolor: tokens.accentSoft, color: tokens.accent } }}>
            Filters {(filterDay !== 'all' || filterSport !== 'all') ? '●' : ''}
          </Button>
          
          <FormControl size="small" sx={{ minWidth: 140, ...inputSx }}>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} displayEmpty sx={{ fontSize: '0.85rem', fontWeight: 600, color: tokens.textSecondary, bgcolor: 'transparent', '& fieldset': { border: 'none' } }}>
              <MenuItem value="day">Sort by Day</MenuItem>
              <MenuItem value="duration">Sort by Duration</MenuItem>
              <MenuItem value="title">Sort by Title</MenuItem>
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem sx={{ borderColor: tokens.borderLight, my: 1 }} />
          
          <Box sx={{ display: 'flex', p: 0.5, gap: 0.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
            {[{ v: 'cards', icon: LayoutDashboard, tip: 'Cards' }, { v: 'table', icon: Table2, tip: 'Table' }, { v: 'calendar', icon: CalendarDays, tip: 'Calendar' }, { v: 'week', icon: Calendar, tip: 'Week Grid' }].map(({ v, icon: Icon, tip }) => (
              <Tooltip key={v} title={tip}>
                <IconButton size="small" onClick={() => setPracticeViewMode(v)} sx={{ p: 1, borderRadius: '10px', transition: 'all 0.2s', bgcolor: practiceViewMode === v ? tokens.orange : 'transparent', color: practiceViewMode === v ? '#fff' : tokens.textSecondary, '&:hover': { bgcolor: practiceViewMode === v ? tokens.orange : tokens.surfaceHover, transform: 'scale(1.05)' } }}>
                  <Icon size={16} strokeWidth={practiceViewMode === v ? 2.5 : 2} />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Expanded Filters Panel */}
        <Collapse in={showFilters}>
          <Box sx={{ ...glassStyle, p: 2.5, mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', bgcolor: 'rgba(19, 23, 32, 0.4)' }}>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.2 }}>Filter by Day</Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {['all', ...allDays].map(d => { 
                  const dp = dayPalette[d]; 
                  const isActive = filterDay === d;
                  return (
                    <Chip key={d} label={d === 'all' ? 'All Days' : dp?.label} onClick={() => setFilterDay(d)} sx={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, height: 28, transition: 'all 0.2s', bgcolor: isActive ? (d === 'all' ? tokens.orange : dp?.accent) : 'rgba(0,0,0,0.3)', color: isActive ? '#fff' : tokens.textSecondary, border: `1px solid ${isActive ? 'transparent' : tokens.borderLight}`, '&:hover': { transform: 'translateY(-2px)' } }} />
                  ); 
                })}
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: tokens.borderLight, mx: 1 }} />
            {uniqueSports.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.7rem', color: tokens.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.2 }}>Filter by Sport</Typography>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  <Chip label="All Sports" onClick={() => setFilterSport('all')} sx={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, height: 28, transition: 'all 0.2s', bgcolor: filterSport === 'all' ? tokens.orange : 'rgba(0,0,0,0.3)', color: filterSport === 'all' ? '#fff' : tokens.textSecondary, border: `1px solid ${filterSport === 'all' ? 'transparent' : tokens.borderLight}`, '&:hover': { transform: 'translateY(-2px)' } }} />
                  {uniqueSports.map(s => (
                    <Chip key={s} label={`${SPORT_ICONS[s] || '🎯'} ${s}`} onClick={() => setFilterSport(s)} sx={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, height: 28, transition: 'all 0.2s', bgcolor: filterSport === s ? tokens.orange : 'rgba(0,0,0,0.3)', color: filterSport === s ? '#fff' : tokens.textSecondary, border: `1px solid ${filterSport === s ? 'transparent' : tokens.borderLight}`, '&:hover': { transform: 'translateY(-2px)' } }} />
                  ))}
                </Box>
              </Box>
            )}
            {(filterDay !== 'all' || filterSport !== 'all') && (
              <Button size="small" onClick={() => { setFilterDay('all'); setFilterSport('all'); }} sx={{ textTransform: 'none', color: tokens.red, fontSize: '0.8rem', fontWeight: 600, ml: 'auto', '&:hover': { bgcolor: tokens.redSoft } }}>
                Clear Filters
              </Button>
            )}
          </Box>
        </Collapse>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.textSecondary, fontWeight: 500 }}>Showing <strong style={{ color: tokens.textPrimary }}>{filteredPractices.length}</strong> of {practicesLocal.length} practices</Typography>
          {filteredPractices.length === 0 && practicesLocal.length > 0 && (<Button size="small" onClick={() => { setPracticeSearch(''); setFilterDay('all'); setFilterSport('all'); }} sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, color: tokens.accent }}>Reset all filters</Button>)}
        </Box>

        {/* Empty State */}
        {practicesLocal.length === 0 && !globalLoading && (
          <Box sx={{ ...glassStyle, py: 10, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 300, background: `radial-gradient(circle, ${tokens.orangeSoft} 0%, transparent 70%)`, opacity: 0.5, pointerEvents: 'none' }} />
            <Box sx={{ fontSize: '4rem', mb: 2, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>🏋️</Box>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, mb: 1, color: tokens.textPrimary, position: 'relative', zIndex: 1 }}>No practices scheduled for {selectedSport}</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: tokens.textSecondary, mb: 3, position: 'relative', zIndex: 1 }}>Try selecting a different sport or check back later.</Typography>
          </Box>
        )}

        {/* Main Content Views */}
        {practicesLocal.length > 0 && practiceViewMode === 'cards' && (
          <Box>
            {allDays.map(day => { 
              const dayPractices = practicesByDay[day] || []; 
              if (dayPractices.length === 0) return null; 
              const dp = dayPalette[day]; 
              return (
                <Box key={day} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 1, borderBottom: `1px solid ${tokens.borderLight}` }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dp.accent, boxShadow: `0 0 10px ${dp.accent}` }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: tokens.textPrimary }}>{day}</Typography>
                    <Chip label={`${dayPractices.length} session${dayPractices.length !== 1 ? 's' : ''}`} size="small" sx={{ bgcolor: `${dp.accent}15`, color: dp.accent, fontWeight: 700, fontSize: '0.75rem', height: 22, border: `1px solid ${dp.accent}30` }} />
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

        {/* Premium Notify Dialog */}
        <Dialog open={conflictDialog.open} onClose={() => setConflictDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: tokens.surface, borderRadius: '24px', border: `1px solid ${tokens.borderLight}`, backdropFilter: 'blur(20px)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' } }}>
          <DialogTitle sx={{ borderBottom: `1px solid ${tokens.borderLight}`, pb: 2, pt: 3, px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: tokens.orangeSoft, borderRadius: '10px' }}><Bell size={20} color={tokens.orange} /></Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>Notify Conflict Concern</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, px: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: `1px dashed ${tokens.borderLight}`, mb: 3 }}>
              <Typography sx={{ fontSize: '0.85rem', color: tokens.textSecondary, lineHeight: 1.6 }}>
                Your practice <strong style={{color: tokens.textPrimary}}>{conflictDialog.practice?.title}</strong> conflicts with <strong style={{color: tokens.textPrimary}}>{conflictDialog.conflictItem?.type || 'event'}</strong>: <strong style={{color: tokens.textPrimary}}>{conflictDialog.conflictItem?.title}</strong> at <strong style={{color: tokens.textPrimary}}>{conflictDialog.conflictItem?.startTime && `${conflictDialog.conflictItem.startTime}-${conflictDialog.conflictItem.endTime}`}</strong>.
              </Typography>
            </Box>
            <TextField fullWidth label="Detailed Message" multiline rows={4} value={conflictDialog.message} onChange={(e) => setConflictDialog(prev => ({ ...prev, message: e.target.value }))} sx={inputSx} margin="normal" />
            <FormControl fullWidth sx={{ ...inputSx, mt: 2 }}>
              <InputLabel>Send to Authority</InputLabel>
              <Select value={conflictDialog.receiverType} onChange={(e) => setConflictDialog(prev => ({ ...prev, receiverType: e.target.value }))} label="Send to Authority">
                <MenuItem value="Lecturer">Lecturer</MenuItem>
                <MenuItem value="Coach">Coach</MenuItem>
                <MenuItem value="Both">Both Authorities</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${tokens.borderLight}` }}>
            <Button onClick={() => setConflictDialog(prev => ({ ...prev, open: false }))} sx={{ color: tokens.textSecondary, fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
            <Button onClick={handleSendConflictRequest} variant="contained" disabled={conflictDialog.sending} sx={{ bgcolor: tokens.orange, fontWeight: 700, borderRadius: '10px', px: 3, '&:hover': { bgcolor: '#ea580c', transform: 'translateY(-2px)' }, transition: 'all 0.2s', textTransform: 'none', boxShadow: `0 8px 20px ${tokens.orangeSoft}` }}>
              {conflictDialog.sending ? <CircularProgress size={20} color="inherit" /> : 'Send Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );};
  // ─── TimetableSection (with Week Grid) ─────────────────────────────────
  const TimetableSection = () => (
    <Box>
      <SectionHeader icon={Calendar} title="Student Timetable" subtitle={`${filteredData.length} entries · ${studentId}`}>
        <Box sx={{ display: 'flex', gap: 1 }}><IconButton onClick={fetchTimetable} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: `1px solid ${tokens.border}`, borderRadius: '10px', color: tokens.textSecondary, '&:hover': { bgcolor: tokens.surfaceHover, color: tokens.accent } }}><RefreshCw size={15} /></IconButton><IconButton onClick={exportData} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: `1px solid ${tokens.border}`, borderRadius: '10px', color: tokens.textSecondary, '&:hover': { bgcolor: tokens.surfaceHover, color: tokens.green } }}><Download size={15} /></IconButton></Box>
      </SectionHeader>
      <Grid container spacing={2} sx={{ mb: 3 }}><Grid item xs={6} sm={3}><StatCard label="Total" value={stats.total} icon={GraduationCap} color={tokens.accent} soft={tokens.accentSoft} /></Grid><Grid item xs={6} sm={3}><StatCard label="Lectures" value={stats.lectures} icon={BookOpen} color={tokens.green} soft={tokens.greenSoft} /></Grid><Grid item xs={6} sm={3}><StatCard label="Practicals" value={stats.practicals} icon={FlaskConical} color={tokens.amber} soft={tokens.amberSoft} /></Grid><Grid item xs={6} sm={3}><StatCard label="Tutorials" value={stats.tutorials} icon={FileText} color={tokens.purple} soft={tokens.purpleSoft} /></Grid></Grid>
      <Box sx={{ ...glassStyle, p: 2, mb: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}><Search size={14} color={tokens.textSecondary} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} /><TextField fullWidth size="small" placeholder="Search module, venue…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} sx={{ ...inputSx, '& .MuiOutlinedInput-root': { pl: 4.5 } }} /></Box>
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>{['all', ...days].map(d => (<Chip key={d} label={d === 'all' ? 'All' : dayPalette[d]?.label} onClick={() => setSelectedDay(d)} size="small" sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.72rem', bgcolor: selectedDay === d ? (d === 'all' ? tokens.accent : dayPalette[d]?.accent) : 'rgba(0,0,0,0.3)', color: selectedDay === d ? '#fff' : tokens.textSecondary, border: `1px solid ${selectedDay === d ? 'transparent' : tokens.border}` }} />))}</Box>
        <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.3)', border: `1px solid ${tokens.border}`, borderRadius: '12px', p: 0.5, gap: 0.5 }}>
          {[{ mode: 'table', icon: Table2, label: 'Table' }, { mode: 'week', icon: CalendarDays, label: 'Week (old)' }, { mode: 'weekGrid', icon: Calendar, label: 'Week Grid' }].map(({ mode, icon: Icon, label }) => (<Button key={mode} onClick={() => setViewMode(mode)} size="small" startIcon={<Icon size={14} />} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderRadius: '10px', px: 1.5, py: 0.7, bgcolor: viewMode === mode ? tokens.accent : 'transparent', color: viewMode === mode ? '#fff' : tokens.textSecondary }}>{label}</Button>))}
        </Box>
        {timetableData.length > 0 && (<Button onClick={handleClearAll} size="small" startIcon={<Trash2 size={14} />} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderRadius: '10px', color: tokens.red, border: `1px solid ${tokens.border}`, px: 1.8, py: 0.9, '&:hover': { bgcolor: tokens.redSoft, borderColor: tokens.red } }}>Clear All</Button>)}
      </Box>
      {viewMode === 'table' && (<Box sx={glassStyle}><TableContainer><Table><TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${tokens.border}`, py: 1.5, px: 2 } }}>{['Day','Time','Module Code','Module Name','Type','Venue','Actions'].map(h => (<TableCell key={h}><Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: tokens.textSecondary }}>{h}</Typography></TableCell>))}</TableRow></TableHead><TableBody>{filteredData.length > 0 ? filteredData.map((item, idx) => { const dp = dayPalette[item.day] || {}; const tc = typeConfig[item.type] || typeConfig.Lecture; const TypeIcon = tc.icon; return (<TableRow key={item._id || idx} sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tokens.border}`, py: 1.5, px: 2 }, '&:hover': { bgcolor: tokens.surfaceHover } }}><TableCell><Chip label={item.day} size="small" sx={{ bgcolor: `${dp.accent}20`, color: dp.accent, border: `1px solid ${dp.accent}40` }} /></TableCell><TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}><Clock size={13} /><Typography sx={{ fontFamily: 'monospace' }}>{item.time}</Typography></Box></TableCell><TableCell><Typography sx={{ color: tokens.accent, fontWeight: 700, fontFamily: 'monospace' }}>{item.moduleCode}</Typography></TableCell><TableCell><Typography noWrap sx={{ maxWidth: 200 }}>{item.moduleName}</Typography></TableCell><TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: tc.soft, borderRadius: '8px', px: 1, py: 0.5, width: 'fit-content' }}><TypeIcon size={12} color={tc.color} /><Typography sx={{ fontSize: '0.72rem', color: tc.color, fontWeight: 700 }}>{item.type}</Typography></Box></TableCell><TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}><MapPin size={13} /><Typography>{item.venue}</Typography></Box></TableCell><TableCell><Box sx={{ display: 'flex', gap: 0.5 }}><Tooltip title="Edit"><IconButton size="small" onClick={() => setEditDialog({ open: true, data: { ...item }, type: 'timetable' })} sx={{ bgcolor: tokens.accentSoft, color: tokens.accent, borderRadius: '8px', p: 0.7, '&:hover': { bgcolor: tokens.accent, color: '#fff' } }}><Edit2 size={13} /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, entry: item, type: 'timetable' })} sx={{ bgcolor: tokens.redSoft, color: tokens.red, borderRadius: '8px', p: 0.7, '&:hover': { bgcolor: tokens.red, color: '#fff' } }}><Trash2 size={13} /></IconButton></Tooltip></Box></TableCell></TableRow>); }) : (<TableRow><TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}><GraduationCap size={40} color={tokens.textMuted} /><Typography sx={{ mt: 1 }}>No entries found. Upload a timetable image.</Typography></TableCell></TableRow>)}</TableBody></Table></TableContainer></Box>)}
      {viewMode === 'week' && (<Box sx={glassStyle}><TableContainer sx={{ overflowX: 'auto' }}><Table sx={{ minWidth: 900 }}><TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${tokens.border}`, py: 1.5, px: 1.5 } }}><TableCell sx={{ minWidth: 80 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Time</Typography></TableCell>{days.map(d => { const dp = dayPalette[d]; return (<TableCell key={d}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dp.accent }} /><Typography sx={{ fontWeight: 700, color: dp.accent }}>{d}</Typography></Box></TableCell>); })}</TableRow></TableHead><TableBody>{timeSlots.map(time => (<TableRow key={time} sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tokens.border}`, py: 1, px: 1.5 } }}><TableCell><Typography sx={{ fontFamily: 'monospace' }}>{time}</Typography></TableCell>{days.map(day => { const entry = timetableData.find(e => e.day === day && e.time === time); const dp = dayPalette[day]; const tc = entry ? (typeConfig[entry.type] || typeConfig.Lecture) : null; const TypeIcon = tc?.icon; return (<TableCell key={`${day}-${time}`}>{entry ? (<Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: `${dp.accent}15`, border: `1px solid ${dp.accent}30`, position: 'relative' }}><Box sx={{ position: 'absolute', top: 0, left: 0, width: '3px', bottom: 0, bgcolor: dp.accent, borderRadius: '10px 0 0 10px' }} /><Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: dp.accent, fontFamily: 'monospace' }}>{entry.moduleCode}</Typography><Typography sx={{ fontSize: '0.68rem', color: tokens.textPrimary }}>{entry.moduleName}</Typography><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>{TypeIcon && <TypeIcon size={10} color={tc.color} />}<Typography sx={{ fontSize: '0.65rem', color: tc?.color }}>{entry.type}</Typography></Box><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><MapPin size={10} /><Typography sx={{ fontSize: '0.65rem' }}>{entry.venue}</Typography></Box></Box>) : (<Typography sx={{ fontSize: '0.7rem', color: tokens.textMuted, textAlign: 'center' }}>—</Typography>)}</TableCell>); })}</TableRow>))}</TableBody></Table></TableContainer></Box>)}
      {viewMode === 'weekGrid' && (<GlobalWeekGrid data={[...timetableData.map(item => ({ ...item, title: `${item.moduleCode} ${item.moduleName}`, startTime: item.time, endTime: getEndTimeFromType(item.time, item.type), type: item.type })), ...practices]} />)}
    </Box>
  );

  // ─── Root Layout with Background Image ─────────────────────────────────────
  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex: 0,
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%' }}>
        <Box sx={{ width: 240, flexShrink: 0, bgcolor: 'rgba(19, 23, 32, 0.85)', backdropFilter: 'blur(16px)', borderRight: `1px solid ${tokens.border}`, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <Box sx={{ px: 3, py: 3, borderBottom: `1px solid ${tokens.border}` }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Box sx={{ p: 1, bgcolor: tokens.accent, borderRadius: '12px' }}><GraduationCap size={18} color="#fff" /></Box><Box><Typography sx={{ fontWeight: 800 }}>ScheduleAI</Typography><Typography sx={{ fontSize: '0.65rem', color: tokens.textSecondary }}>Timetable Management</Typography></Box></Box></Box>
          <Box sx={{ mx: 2, my: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '14px', border: `1px solid ${tokens.border}`, backdropFilter: 'blur(8px)' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, bgcolor: tokens.accentSoft, color: tokens.accent }}>{studentId.slice(-2)}</Avatar><Box><Typography sx={{ fontWeight: 600 }} noWrap>{studentId}</Typography><Typography sx={{ fontSize: '0.68rem', color: tokens.textSecondary }}>Group {group}</Typography></Box></Box></Box>
          <Divider sx={{ borderColor: tokens.border, mx: 2, mb: 1 }} />
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', px: 3.5, pb: 1 }}>Navigation</Typography>
          <Box sx={{ flex: 1 }}><NavItem icon={Upload} label="Upload Timetable" active={section === 'upload'} onClick={() => setSection('upload')} /><NavItem icon={Dumbbell} label="Practice Scheduling" active={section === 'practice'} onClick={() => setSection('practice')} /><NavItem icon={CalendarDays} label="Student Timetable" active={section === 'view'} onClick={() => setSection('view')} badge={timetableData.length} /></Box>
          <Box sx={{ borderTop: `1px solid ${tokens.border}`, pt: 1.5, pb: 2 }}>
            <NavItem icon={LogOut} label="Logout" onClick={() => setLogoutDialog(true)} />
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>{section === 'upload' && <UploadSection />}{section === 'practice' && <PracticeSection />}{section === 'view' && <TimetableSection />}</Box>
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })} PaperProps={{ sx: { bgcolor: tokens.surface, borderRadius: '20px', backdropFilter: 'blur(16px)', border: `1px solid ${tokens.border}` } }}><DialogTitle>Confirm Delete</DialogTitle><DialogContent>Are you sure you want to delete this {deleteDialog.type === 'practice' ? 'practice' : 'timetable entry'}?</DialogContent><DialogActions><Button onClick={() => setDeleteDialog({ open: false })}>Cancel</Button><Button onClick={() => { if (deleteDialog.type === 'practice') { showSnackbar('Practices can only be deleted by coaches', 'error'); } else { handleDeleteTimetable(deleteDialog.entry._id); } setDeleteDialog({ open: false }); }} color="error">Delete</Button></DialogActions></Dialog>
        <Dialog open={editDialog.open && editDialog.type === 'timetable'} onClose={() => setEditDialog({ open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: tokens.surface, borderRadius: '20px', backdropFilter: 'blur(16px)', border: `1px solid ${tokens.border}` } }}><DialogTitle>Edit Timetable Entry</DialogTitle><DialogContent>{editDialog.data && (<Grid container spacing={2} sx={{ mt: 0.5 }}>{[{ key: 'day', label: 'Day', xs: 6 },{ key: 'time', label: 'Time', xs: 6 },{ key: 'moduleCode', label: 'Module Code', xs: 6 },{ key: 'type', label: 'Type', xs: 6 },{ key: 'moduleName', label: 'Module Name', xs: 12 },{ key: 'venue', label: 'Venue', xs: 12 }].map(({ key, label, xs }) => (<Grid item xs={xs} key={key}><TextField fullWidth label={label} value={editDialog.data[key] || ''} onChange={e => setEditDialog({ ...editDialog, data: { ...editDialog.data, [key]: e.target.value } })} sx={inputSx} size="small" /></Grid>))}</Grid>)}</DialogContent><DialogActions><Button onClick={() => setEditDialog({ open: false })}>Cancel</Button><Button onClick={() => handleEditTimetable(editDialog.data)} variant="contained">Save</Button></DialogActions></Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity={snackbar.severity} sx={{ bgcolor: tokens.surface, color: tokens.textPrimary, border: `1px solid ${tokens.border}`, backdropFilter: 'blur(8px)' }}>{snackbar.message}</Alert></Snackbar>
      </Box>
      <Dialog
  open={logoutDialog}
  onClose={() => setLogoutDialog(false)}
  PaperProps={{ sx: { bgcolor: tokens.surface, borderRadius: '20px', backdropFilter: 'blur(16px)', border: `1px solid ${tokens.border}` } }}
>
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
          <Button onClick={() => setLogoutDialog(false)} sx={{ color: tokens.textSecondary, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              clearAuthStorage();           // clears token
              window.location.href = '/login';  // redirect to login
            }}
            variant="contained"
            sx={{ bgcolor: tokens.red, '&:hover': { bgcolor: '#dc2626' }, textTransform: 'none' }}
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>
            </Box>
    
  );
};

export default TimetableDashboard;