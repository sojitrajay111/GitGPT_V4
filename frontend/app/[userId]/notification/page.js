// app/[userId]/notification/page.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Link as MuiLink,
  Card,
  CardContent,
  Chip,
  Fade,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import DeleteIcon from "@mui/icons-material/Delete";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns"; // For time formatting
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useGetThemeQuery } from "@/features/themeApiSlice"; // Assuming theme slice exists
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} from "@/features/notificationApiSlice"; // Import the new notification API hooks

// Placeholder for theme definitions if not imported externally
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4f46e5' },
    background: { default: '#f9fafb', paper: '#ffffff' },
    text: { primary: '#1f2937', secondary: '#6b7280' },
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } } },
    MuiListItem: { styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } } } },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#a78bfa' },
    background: { default: 'black', paper: '#1e1e1e' },
    text: { primary: '#e0e0e0', secondary: '#a0a0a0' },
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' } } },
    MuiListItem: { styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } } } },
  },
});
// End Placeholder

// Utility to group notifications by date
function groupNotificationsByDate(notifications) {
  const groups = {};
  notifications.forEach((notif) => {
    const date = new Date(notif.createdAt);
    const dateKey = date.toDateString(); // e.g., 'Thu May 30 2024'
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(notif);
  });
  // Convert to array of { date, notifications } sorted by date desc
  return Object.entries(groups)
    .map(([date, notifs]) => ({ date, notifications: notifs }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getDateLabel(dateString) {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

const NotificationPage = () => {
  const params = useParams();
  const userId = params.userId;
  const router = useRouter();

  // Theme logic
  const { data: themePreferenceData, isLoading: themeLoading } = useGetThemeQuery(userId, { skip: !userId });
  const [currentThemeMode, setCurrentThemeMode] = useState("light");

  useEffect(() => {
    if (themePreferenceData?.theme) {
      setCurrentThemeMode(themePreferenceData.theme);
    }
  }, [themePreferenceData]);

  const activeTheme = currentThemeMode === "dark" ? darkTheme : lightTheme;

  // Get logged-in userId from Redux (authSlice)
  const userInfo = useSelector(state => state.auth.userInfo);
  let loggedInUserId = userInfo?._id || userInfo?.id;
  // Fallback: try to get userId from localStorage if Redux is empty (optional, for robustness)
  if (!loggedInUserId && typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        loggedInUserId = parsed._id || parsed.id;
      }
    } catch (e) {}
  }

  // Fetch notifications for the logged-in user only
  const {
    data: notifications,
    isLoading: notificationsLoading,
    isError: notificationsIsError,
    error: notificationsError,
    refetch: refetchNotifications, // To manually refetch if needed
  } = useGetNotificationsQuery(loggedInUserId, { skip: !loggedInUserId });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Filter notifications by date range
  const filteredNotifications = notifications?.filter(n => {
    if (!startDate && !endDate) return true;
    const created = new Date(n.createdAt);
    // Normalize times to midnight for comparison
    const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    const startDay = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;
    const endDay = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;
    if (startDay && createdDay < startDay) return false;
    if (endDay && createdDay > endDay) return false;
    return true;
  });

  if (!loggedInUserId) {
    return (
      <ThemeProvider theme={activeTheme}>
        <Box className="min-h-screen flex items-center justify-center" sx={{ bgcolor: activeTheme.palette.background.default }}>
          <Alert severity="warning" className="rounded-xl w-full max-w-md">
            Unable to determine logged-in user. Please log in again.
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  // Mutation to mark notification as read
  const [
    markNotificationAsRead,
    { isLoading: markAsReadLoading, isError: markAsReadIsError, error: markAsReadError },
  ] = useMarkNotificationAsReadMutation();

  // Delete notification mutation
  const [deleteNotification, { isLoading: deleteLoading }] = useDeleteNotificationMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  const handleOpenDeleteDialog = (notification) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setNotificationToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (notificationToDelete) {
      await deleteNotification(notificationToDelete._id);
      handleCloseDeleteDialog();
    }
  };

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId).unwrap();
      // RTK Query's invalidatesTags will automatically refetch 'Notifications'
      // No explicit refetchNotifications() needed here because of invalidatesTags
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Optionally show a user-friendly error message
      alert("Failed to mark notification as read. Please try again."); // Using alert for simplicity, replace with custom modal.
    }
  }, [markNotificationAsRead]);

  if (themeLoading || notificationsLoading) {
    return (
      <ThemeProvider theme={activeTheme}>
        <Box
          className="flex justify-center items-center min-h-screen"
          sx={{ bgcolor: activeTheme.palette.background.default }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: activeTheme.palette.primary.main }}
          />
        </Box>
      </ThemeProvider>
    );
  }

  if (notificationsIsError) {
    return (
      <ThemeProvider theme={activeTheme}>
        <Box
          p={4}
          className="min-h-screen flex items-center justify-center"
          sx={{ bgcolor: activeTheme.palette.background.default }}
        >
          <Alert severity="error" className="rounded-xl w-full max-w-md">
            Failed to load notifications:{" "}
            {notificationsError?.data?.message ||
              notificationsError?.status ||
              "Unknown error"}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  // Group unread and read notifications by date
  const unreadNotifications = filteredNotifications?.filter(n => !n.isRead) || [];
  const readNotifications = filteredNotifications?.filter(n => n.isRead) || [];
  const groupedUnread = groupNotificationsByDate(unreadNotifications);
  const groupedRead = groupNotificationsByDate(readNotifications);

  return (
    <ThemeProvider theme={activeTheme}>
      <Box
        className="min-h-screen p-4 md:p-8 lg:p-12"
        sx={{
          bgcolor: activeTheme.palette.background.default,
          color: activeTheme.palette.text.primary,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center"
          sx={{ color: activeTheme.palette.text.primary, mb: 4, fontWeight: 700 }}>
          Your Notifications
        </Typography>

        {/* Date filter UI */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box display="flex" gap={2} mb={4} justifyContent="center">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
              maxDate={endDate || undefined}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
              minDate={startDate || undefined}
            />
            {(startDate || endDate) && (
              <Button variant="outlined" color="secondary" onClick={() => { setStartDate(null); setEndDate(null); }}>
                Clear Filter
              </Button>
            )}
          </Box>
        </LocalizationProvider>

        {filteredNotifications?.length === 0 ? (
          <Fade in={true} timeout={1000}>
            <Box sx={{
              textAlign: 'center',
              mt: 8,
              p: 4,
              bgcolor: activeTheme.palette.background.paper,
              borderRadius: '12px',
              boxShadow: activeTheme.components.MuiCard.styleOverrides.root.boxShadow,
            }}>
              <Typography variant="h6" color="text.secondary">
                No notifications found for the selected date range.
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            {groupedUnread.length > 0 && (
              <Box mb={4}>
                <Typography variant="h5" sx={{ color: activeTheme.palette.text.primary, mb: 2 }}>
                  Unread ({unreadNotifications.length})
                </Typography>
                {groupedUnread.map(group => (
                  <Box key={group.date} mb={2}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: activeTheme.palette.text.secondary, fontWeight: 700 }}>
                      {getDateLabel(group.date)}
                    </Typography>
                    <Card sx={{ bgcolor: activeTheme.palette.background.paper }}>
                      <List>
                        {group.notifications.map((notification) => (
                          <ListItem
                            key={notification._id}
                            divider
                            sx={{
                              bgcolor: activeTheme.palette.mode === 'light' && !notification.isRead ? '#fffbe6' : notification.isRead ? undefined : '#2a2a1a',
                              borderLeft: !notification.isRead ? `4px solid ${activeTheme.palette.warning.main}` : undefined,
                              borderRadius: '8px',
                              mb: 1,
                              p: 2,
                              alignItems: 'flex-start',
                              opacity: notification.isRead ? 0.7 : 1,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: notification.isRead ? 'normal' : 'medium', color: notification.isRead ? activeTheme.palette.text.secondary : activeTheme.palette.text.primary }}
                                >
                                  {notification.message}
                                </Typography>
                              }
                              secondary={
                                <Box mt={0.5}>
                                  {notification.link && (
                                    <MuiLink
                                      href={notification.link}
                                      sx={{
                                        color: activeTheme.palette.primary.main,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        router.push(notification.link);
                                        if (!notification.isRead) handleMarkAsRead(notification._id);
                                      }}
                                    >
                                      View Details
                                    </MuiLink>
                                  )}
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </Typography>
                                  <Chip
                                    label={notification.projectName}
                                    size="small"
                                    color={notification.isRead ? "default" : "primary"}
                                    sx={{ mt: 1, bgcolor: !notification.isRead ? activeTheme.palette.primary.dark : undefined, color: !notification.isRead ? activeTheme.palette.primary.contrastText : undefined }}
                                  />
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              {notification.isRead ? (
                                <IconButton edge="end" aria-label="read" disabled>
                                  <MarkEmailUnreadIcon sx={{ color: activeTheme.palette.text.secondary }} />
                                </IconButton>
                              ) : (
                                <IconButton
                                  edge="end"
                                  aria-label="mark as read"
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  disabled={markAsReadLoading}
                                  sx={{ color: activeTheme.palette.success.main }}
                                >
                                  {markAsReadLoading ? <CircularProgress size={20} /> : <MarkEmailReadIcon />}
                                </IconButton>
                              )}
                              <IconButton
                                edge="end"
                                aria-label="delete notification"
                                onClick={() => handleOpenDeleteDialog(notification)}
                                disabled={deleteLoading}
                                sx={{ color: activeTheme.palette.error.main, ml: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}

            {groupedRead.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ color: activeTheme.palette.text.primary, mb: 2 }}>
                  Read ({readNotifications.length})
                </Typography>
                {groupedRead.map(group => (
                  <Box key={group.date} mb={2}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: activeTheme.palette.text.secondary, fontWeight: 700 }}>
                      {getDateLabel(group.date)}
                    </Typography>
                    <Card sx={{ bgcolor: activeTheme.palette.background.paper }}>
                      <List>
                        {group.notifications.map((notification) => (
                          <ListItem
                            key={notification._id}
                            divider
                            sx={{
                              opacity: 0.7,
                              p: 2,
                              mb: 1,
                              alignItems: 'flex-start',
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ color: activeTheme.palette.text.secondary }}>
                                  {notification.message}
                                </Typography>
                              }
                              secondary={
                                <Box mt={0.5}>
                                  {notification.link && (
                                    <MuiLink
                                      href={notification.link}
                                      sx={{
                                        color: activeTheme.palette.primary.main,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        router.push(notification.link);
                                      }}
                                    >
                                      View Details
                                    </MuiLink>
                                  )}
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </Typography>
                                  <Chip
                                    label={notification.projectName}
                                    size="small"
                                    color="default"
                                    sx={{ mt: 1 }}
                                  />
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" aria-label="read" disabled>
                                <MarkEmailUnreadIcon sx={{ color: activeTheme.palette.text.secondary }} />
                              </IconButton>
                              <IconButton
                                edge="end"
                                aria-label="delete notification"
                                onClick={() => handleOpenDeleteDialog(notification)}
                                disabled={deleteLoading}
                                sx={{ color: activeTheme.palette.error.main, ml: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-notification-dialog-title"
          aria-describedby="delete-notification-dialog-description"
        >
          <DialogTitle id="delete-notification-dialog-title">Delete Notification?</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-notification-dialog-description">
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" disabled={deleteLoading} autoFocus>
              {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default NotificationPage;
