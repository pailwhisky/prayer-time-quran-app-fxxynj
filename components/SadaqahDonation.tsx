
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CharityOrganization {
  id: string;
  name: string;
  description: string;
  category: string;
  website: string;
  verified: boolean;
  impact: string;
}

interface DonationRecord {
  id?: string;
  user_id?: string;
  amount: number;
  charity_name: string;
  date: string;
  notes?: string;
}

interface SadaqahDonationProps {
  visible: boolean;
  onClose: () => void;
}

const CHARITY_ORGANIZATIONS: CharityOrganization[] = [
  {
    id: '1',
    name: 'Islamic Relief Worldwide',
    description: 'Providing humanitarian aid and development programs globally',
    category: 'Humanitarian Aid',
    website: 'https://www.islamic-relief.org',
    verified: true,
    impact: 'Helps millions in 40+ countries'
  },
  {
    id: '2',
    name: 'Penny Appeal',
    description: 'Fighting poverty through sustainable development projects',
    category: 'Poverty Relief',
    website: 'https://www.pennyappeal.org',
    verified: true,
    impact: 'Active in 30+ countries'
  },
  {
    id: '3',
    name: 'Human Appeal',
    description: 'Emergency relief and long-term development programs',
    category: 'Emergency Relief',
    website: 'https://www.humanappeal.org.uk',
    verified: true,
    impact: 'Serving communities worldwide'
  },
  {
    id: '4',
    name: 'Muslim Aid',
    description: 'Tackling poverty, illiteracy and social injustice',
    category: 'Development',
    website: 'https://www.muslimaid.org',
    verified: true,
    impact: 'Operating in 70+ countries'
  },
  {
    id: '5',
    name: 'Local Mosque Fund',
    description: 'Support your local mosque and community',
    category: 'Community',
    website: '',
    verified: true,
    impact: 'Strengthens local community'
  },
];

export default function SadaqahDonation({ visible, onClose }: SadaqahDonationProps) {
  const [selectedCharity, setSelectedCharity] = useState<CharityOrganization | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationNotes, setDonationNotes] = useState('');
  const [totalDonated, setTotalDonated] = useState(0);
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (visible) {
      loadDonationHistory();
    }
  }, [visible]);

  const loadDonationHistory = async () => {
    try {
      // Try to load from Supabase first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('spiritual_progress')
          .select('date, charity_amount, notes')
          .eq('user_id', user.id)
          .gt('charity_amount', 0)
          .order('date', { ascending: false })
          .limit(20);

        if (!error && data) {
          const records: DonationRecord[] = data.map(item => ({
            amount: Number(item.charity_amount),
            charity_name: 'Various',
            date: item.date,
            notes: item.notes || ''
          }));
          setDonationHistory(records);
          
          const total = records.reduce((sum, record) => sum + record.amount, 0);
          setTotalDonated(total);
          return;
        }
      }

      // Fallback to AsyncStorage
      const stored = await AsyncStorage.getItem('donation_history');
      if (stored) {
        const history: DonationRecord[] = JSON.parse(stored);
        setDonationHistory(history);
        const total = history.reduce((sum, record) => sum + record.amount, 0);
        setTotalDonated(total);
      }
    } catch (error) {
      console.error('Error loading donation history:', error);
    }
  };

  const saveDonationRecord = async (record: DonationRecord) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save to Supabase
        const { error } = await supabase
          .from('spiritual_progress')
          .upsert({
            user_id: user.id,
            date: record.date,
            charity_amount: record.amount,
            notes: `Sadaqah: ${record.charity_name}${record.notes ? ' - ' + record.notes : ''}`,
          }, {
            onConflict: 'user_id,date'
          });

        if (error) {
          console.error('Error saving to Supabase:', error);
        }
      }

      // Also save to AsyncStorage as backup
      const newHistory = [record, ...donationHistory];
      await AsyncStorage.setItem('donation_history', JSON.stringify(newHistory));
      setDonationHistory(newHistory);
      setTotalDonated(totalDonated + record.amount);
    } catch (error) {
      console.error('Error saving donation record:', error);
    }
  };

  const handleDonate = () => {
    if (!selectedCharity) {
      Alert.alert('Select Charity', 'Please select a charity organization first.');
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }

    Alert.alert(
      'Record Donation',
      `Record a donation of $${amount.toFixed(2)} to ${selectedCharity.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Record',
          onPress: async () => {
            const record: DonationRecord = {
              amount,
              charity_name: selectedCharity.name,
              date: new Date().toISOString().split('T')[0],
              notes: donationNotes,
            };

            await saveDonationRecord(record);

            Alert.alert(
              'Donation Recorded',
              `May Allah accept your Sadaqah of $${amount.toFixed(2)}.\n\n"The example of those who spend their wealth in the way of Allah is like a seed of grain that sprouts seven ears; in every ear there are a hundred grains." (Quran 2:261)`,
              [
                {
                  text: 'Visit Website',
                  onPress: () => {
                    if (selectedCharity.website) {
                      Linking.openURL(selectedCharity.website);
                    }
                  }
                },
                { text: 'Done' }
              ]
            );

            setDonationAmount('');
            setDonationNotes('');
            setSelectedCharity(null);
          }
        }
      ]
    );
  };

  const renderCharityCard = (charity: CharityOrganization) => {
    const isSelected = selectedCharity?.id === charity.id;

    return (
      <TouchableOpacity
        key={charity.id}
        style={[styles.charityCard, isSelected && styles.charityCardSelected]}
        onPress={() => setSelectedCharity(charity)}
      >
        <View style={styles.charityHeader}>
          <View style={styles.charityTitleRow}>
            <Text style={styles.charityName}>{charity.name}</Text>
            {charity.verified && (
              <IconSymbol name="checkmark.seal.fill" size={18} color={colors.accent} />
            )}
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{charity.category}</Text>
          </View>
        </View>
        <Text style={styles.charityDescription}>{charity.description}</Text>
        <Text style={styles.charityImpact}>✨ {charity.impact}</Text>
        {charity.website && (
          <TouchableOpacity
            style={styles.websiteButton}
            onPress={() => Linking.openURL(charity.website)}
          >
            <IconSymbol name="globe" size={16} color={colors.primary} />
            <Text style={styles.websiteText}>Visit Website</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderDonationHistory = () => (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <TouchableOpacity onPress={() => setShowHistory(false)}>
          <IconSymbol name="arrow.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.historyTitle}>Donation History</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Sadaqah Given</Text>
        <Text style={styles.totalAmount}>${totalDonated.toFixed(2)}</Text>
        <Text style={styles.totalVerse}>
          "Never will you attain righteousness until you spend from that which you love." (Quran 3:92)
        </Text>
      </View>

      <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
        {donationHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="heart" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No donations recorded yet</Text>
          </View>
        ) : (
          donationHistory.map((record, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyCharity}>{record.charity_name}</Text>
                <Text style={styles.historyDate}>{new Date(record.date).toLocaleDateString()}</Text>
                {record.notes && <Text style={styles.historyNotes}>{record.notes}</Text>}
              </View>
              <Text style={styles.historyAmount}>${record.amount.toFixed(2)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {showHistory ? (
          renderDonationHistory()
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
                <IconSymbol name="xmark" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.title}>Sadaqah</Text>
              <TouchableOpacity onPress={() => setShowHistory(true)}>
                <IconSymbol name="clock" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>💚 Give Sadaqah</Text>
                <Text style={styles.infoText}>
                  Sadaqah is voluntary charity given out of compassion, love, or generosity. 
                  The Prophet (ﷺ) said: "Charity does not decrease wealth." (Muslim)
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>${totalDonated.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Total Given</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{donationHistory.length}</Text>
                  <Text style={styles.statLabel}>Donations</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Select Charity</Text>
              {CHARITY_ORGANIZATIONS.map(renderCharityCard)}

              {selectedCharity && (
                <View style={styles.donationForm}>
                  <Text style={styles.sectionTitle}>Donation Amount</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={donationAmount}
                      onChangeText={setDonationAmount}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.quickAmounts}>
                    {[5, 10, 25, 50, 100].map(amount => (
                      <TouchableOpacity
                        key={amount}
                        style={styles.quickAmountButton}
                        onPress={() => setDonationAmount(amount.toString())}
                      >
                        <Text style={styles.quickAmountText}>${amount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={donationNotes}
                    onChangeText={setDonationNotes}
                    placeholder="Add a note about this donation..."
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={colors.textSecondary}
                  />

                  <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
                    <IconSymbol name="heart.fill" size={20} color="#FFFFFF" />
                    <Text style={styles.donateButtonText}>Record Donation</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 100 }} />
            </ScrollView>
          </>
        )}
      </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  charityCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  charityCardSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: 'rgba(212, 163, 115, 0.05)',
  },
  charityHeader: {
    marginBottom: 8,
  },
  charityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  charityName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  charityDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  charityImpact: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  websiteText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  donationForm: {
    marginTop: 24,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickAmountButton: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  donateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    boxShadow: `0px 6px 16px ${colors.shadow}`,
    elevation: 5,
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  totalVerse: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyCharity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  historyNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  historyAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
