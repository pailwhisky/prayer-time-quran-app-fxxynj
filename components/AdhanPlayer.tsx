
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface AdhanRecording {
  id: string;
  name: string;
  location: string;
  reciter: string;
  url: string;
}

const adhanRecordings: AdhanRecording[] = [
  {
    id: '1',
    name: 'Makkah Adhan',
    location: 'Masjid al-Haram, Makkah',
    reciter: 'Sheikh Ali Ahmed Mulla',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Sample URL
  },
  {
    id: '2',
    name: 'Madinah Adhan',
    location: 'Masjid an-Nabawi, Madinah',
    reciter: 'Sheikh Abdullah Basfar',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Sample URL
  },
  {
    id: '3',
    name: 'Al-Aqsa Adhan',
    location: 'Al-Aqsa Mosque, Jerusalem',
    reciter: 'Sheikh Ikrimah Sabri',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Sample URL
  },
];

interface AdhanPlayerProps {
  visible: boolean;
  onClose: () => void;
  onSelectAdhan: (recording: AdhanRecording) => void;
}

export default function AdhanPlayer({ visible, onClose, onSelectAdhan }: AdhanPlayerProps) {
  const [selectedRecording, setSelectedRecording] = useState<AdhanRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const player = useAudioPlayer(selectedRecording?.url || null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setIsPlaying(status.isPlaying);
  }, [status.isPlaying]);

  const handlePlayPause = async (recording: AdhanRecording) => {
    try {
      if (selectedRecording?.id !== recording.id) {
        setSelectedRecording(recording);
        await player.replace(recording.url);
      }

      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.error('Error playing adhan:', error);
      Alert.alert('Error', 'Failed to play adhan recording');
    }
  };

  const handleSelectAdhan = (recording: AdhanRecording) => {
    onSelectAdhan(recording);
    onClose();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Adhan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Choose from beautiful Adhan recordings from holy places around the world
          </Text>

          {adhanRecordings.map((recording) => (
            <View key={recording.id} style={styles.recordingCard}>
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingName}>{recording.name}</Text>
                <Text style={styles.recordingLocation}>{recording.location}</Text>
                <Text style={styles.recordingReciter}>Reciter: {recording.reciter}</Text>
              </View>

              <View style={styles.recordingControls}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => handlePlayPause(recording)}
                >
                  <IconSymbol
                    name={
                      selectedRecording?.id === recording.id && isPlaying
                        ? 'pause'
                        : 'play-arrow'
                    }
                    size={24}
                    color={colors.card}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => handleSelectAdhan(recording)}
                >
                  <Text style={styles.selectButtonText}>Select</Text>
                </TouchableOpacity>
              </View>

              {selectedRecording?.id === recording.id && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            status.duration > 0
                              ? (status.currentTime / status.duration) * 100
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.timeText}>
                    {formatDuration(status.currentTime)} / {formatDuration(status.duration)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
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
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  recordingCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  recordingInfo: {
    marginBottom: 12,
  },
  recordingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  recordingLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  recordingReciter: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
