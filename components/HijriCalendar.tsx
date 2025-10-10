
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

interface HijriEvent {
  id: string;
  title: string;
  description?: string;
  hijri_date: string;
  gregorian_date?: string;
  is_recurring: boolean;
  event_type: string;
}

interface UserEvent {
  id?: string;
  title: string;
  description?: string;
  date: string;
  event_type: string;
}

interface HijriCalendarProps {
  visible: boolean;
  onClose: () => void;
}

// Simplified Hijri date conversion (approximation)
const convertToHijri = (gregorianDate: Date): string => {
  // This is a simplified conversion - in a real app, you'd use a proper Hijri calendar library
  const hijriEpoch = new Date('622-07-16'); // Approximate start of Hijri calendar
  const daysDiff = Math.floor((gregorianDate.getTime() - hijriEpoch.getTime()) / (1000 * 60 * 60 * 24));
  const hijriYear = Math.floor(daysDiff / 354.37) + 1; // Approximate Hijri year length
  const dayOfYear = daysDiff % 354;
  const hijriMonth = Math.floor(dayOfYear / 29.5) + 1;
  const hijriDay = Math.floor(dayOfYear % 29.5) + 1;
  
  return `${hijriDay} ${getHijriMonthName(hijriMonth)} ${hijriYear}`;
};

const getHijriMonthName = (month: number): string => {
  const months = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
  ];
  return months[month - 1] || 'Unknown';
};

export default function HijriCalendar({ visible, onClose }: HijriCalendarProps) {
  const [hijriEvents, setHijriEvents] = useState<HijriEvent[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<UserEvent>({
    title: '',
    description: '',
    date: '',
    event_type: 'personal',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadEvents();
    }
  }, [visible]);

  const loadEvents = async () => {
    try {
      // Load Hijri events
      const { data: hijriData, error: hijriError } = await supabase
        .from('hijri_events')
        .select('*')
        .order('hijri_date');

      if (hijriError) {
        console.error('Error loading hijri events:', hijriError);
      } else {
        setHijriEvents(hijriData || []);
      }

      // Load user events
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('user_events')
          .select('*')
          .eq('user_id', user.id)
          .order('date');

        if (userError) {
          console.error('Error loading user events:', userError);
        } else {
          setUserEvents(userData || []);
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserEvent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to add events');
        return;
      }

      if (!newEvent.title.trim() || !newEvent.date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const eventData = {
        ...newEvent,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('user_events')
        .insert([eventData]);

      if (error) {
        console.error('Error saving event:', error);
        Alert.alert('Error', 'Failed to save event');
        return;
      }

      Alert.alert('Success', 'Event added successfully');
      setNewEvent({
        title: '',
        description: '',
        date: '',
        event_type: 'personal',
      });
      setShowAddEvent(false);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const userEventsForDate = userEvents.filter(event => event.date === dateString);
    
    // For simplicity, we'll show all recurring Hijri events
    // In a real app, you'd calculate which Hijri events fall on this Gregorian date
    return {
      userEvents: userEventsForDate,
      hijriEvents: hijriEvents.filter(event => event.is_recurring),
    };
  };

  const renderCalendarDay = (date: Date, isCurrentMonth: boolean) => {
    const events = getEventsForDate(date);
    const hasEvents = events.userEvents.length > 0 || events.hijriEvents.length > 0;
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.calendarDay,
          !isCurrentMonth && styles.calendarDayInactive,
          isToday && styles.calendarDayToday,
          isSelected && styles.calendarDaySelected,
          hasEvents && styles.calendarDayWithEvents,
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text
          style={[
            styles.calendarDayText,
            !isCurrentMonth && styles.calendarDayTextInactive,
            isToday && styles.calendarDayTextToday,
            isSelected && styles.calendarDayTextSelected,
          ]}
        >
          {date.getDate()}
        </Text>
        {hasEvents && <View style={styles.eventIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateIter = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDateIter.getMonth() === month;
      days.push(renderCalendarDay(new Date(currentDateIter), isCurrentMonth));
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            <IconSymbol name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
            <IconSymbol name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>{days}</View>
      </View>
    );
  };

  const renderEventDetails = () => {
    if (!selectedDate) return null;

    const events = getEventsForDate(selectedDate);
    const hijriDate = convertToHijri(selectedDate);

    return (
      <View style={styles.eventDetails}>
        <Text style={styles.eventDetailsTitle}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.hijriDate}>{hijriDate} AH</Text>

        {events.hijriEvents.length > 0 && (
          <View style={styles.eventSection}>
            <Text style={styles.eventSectionTitle}>Islamic Events</Text>
            {events.hijriEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {events.userEvents.length > 0 && (
          <View style={styles.eventSection}>
            <Text style={styles.eventSectionTitle}>Personal Events</Text>
            {events.userEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {events.userEvents.length === 0 && events.hijriEvents.length === 0 && (
          <Text style={styles.noEventsText}>No events for this date</Text>
        )}
      </View>
    );
  };

  const renderAddEventModal = () => (
    <Modal
      visible={showAddEvent}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddEvent(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Personal Event</Text>
          <TouchableOpacity onPress={() => setShowAddEvent(false)}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Title *</Text>
            <TextInput
              style={styles.textInput}
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              placeholder="Enter event title"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date *</Text>
            <TextInput
              style={styles.textInput}
              value={newEvent.date}
              onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
              placeholder="Enter event description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Type</Text>
            <View style={styles.eventTypeButtons}>
              {['personal', 'family', 'religious', 'work'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.eventTypeButton,
                    newEvent.event_type === type && styles.eventTypeButtonActive,
                  ]}
                  onPress={() => setNewEvent({ ...newEvent, event_type: type })}
                >
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      newEvent.event_type === type && styles.eventTypeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveUserEvent}>
            <Text style={styles.saveButtonText}>Save Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Islamic Calendar</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddEvent(true)}
            >
              <IconSymbol name="add" size={20} color={colors.card} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCalendar()}
          {renderEventDetails()}
        </ScrollView>

        {renderAddEventModal()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  calendar: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  calendarDaySelected: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },
  calendarDayWithEvents: {
    backgroundColor: colors.highlight,
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  calendarDayTextInactive: {
    color: colors.textSecondary,
  },
  calendarDayTextToday: {
    color: colors.card,
    fontWeight: 'bold',
  },
  calendarDayTextSelected: {
    color: colors.card,
    fontWeight: 'bold',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.card,
  },
  eventDetails: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  hijriDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  eventSection: {
    marginBottom: 16,
  },
  eventSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  eventCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  noEventsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  eventTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  eventTypeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  eventTypeButtonTextActive: {
    color: colors.card,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
