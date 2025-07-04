import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  IconButton,
  FAB,
  Searchbar,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  fetchLocalInstitutions, 
  deleteLocalInstitution,
  fetchInstitutionalBanks,
  deleteInstitutionalBank
} from '../services/database';
import { ThemeContext } from '../utils/ThemeContext';

const BankListScreen = ({ navigation }) => {
  const [localInstitutions, setLocalInstitutions] = useState([]);
  const [institutionalBanks, setInstitutionalBanks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('local');
  const { colors } = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const loadData = async () => {
      const [localData, bankData] = await Promise.all([
        fetchLocalInstitutions(),
        fetchInstitutionalBanks()
      ]);
      setLocalInstitutions(localData);
      setInstitutionalBanks(bankData);
    };
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const handleEditLocalInstitution = (institution) => {
    navigation.navigate('LocalInstitutionForm', { institution });
  };

  const handleDeleteLocalInstitution = async (id) => {
    await deleteLocalInstitution(id);
    setLocalInstitutions(localInstitutions.filter((i) => i.id !== id));
  };

  const handleViewLocalInstitutionDetails = (institution) => {
    navigation.navigate('LocalInstitutionDetails', { institution });
  };

  const handleEditInstitutionalBank = (bank) => {
    navigation.navigate('InstitutionalBankForm', { bank });
  };

  const handleDeleteInstitutionalBank = async (id) => {
    await deleteInstitutionalBank(id);
    setInstitutionalBanks(institutionalBanks.filter((b) => b.id !== id));
  };

  const handleViewInstitutionalBankDetails = (bank) => {
    navigation.navigate('InstitutionalBankDetails', { bank });
  };

  const renderLocalInstitutionStatusChip = (status) => {
    const statusConfig = {
      paid: { color: colors.success, icon: 'check-circle' },
      pending: { color: colors.accent, icon: 'clock-outline' },
      default: { color: colors.primary, icon: 'help-circle' },
    };

    const { color, icon } = statusConfig[status] || statusConfig.default;

    return (
      <Chip
        icon={({ size }) => (
          <MaterialCommunityIcons
            name={icon}
            size={14}
            color={colors.surface}
          />
        )}
        style={[
          styles.chip,
          {
            backgroundColor: color,
            borderColor: colors.primary,
            borderWidth: 0.5,
          },
        ]}
        textStyle={{ color: colors.surface, fontSize: 12, fontWeight: '600' }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  const renderLocalInstitutionItem = ({ item, index }) => {
    const totalPayments = item.payments.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    const weeklyAmount = parseFloat(item.weeklyAmount) || 0;
    const typeMultiplier = {
      full: 1,
      half: 0.5,
      quarter: 0.25
    }[item.type] || 1;
    const expectedAmount = weeklyAmount * typeMultiplier;

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100).duration(300)}
        key={item.id}>
        <TouchableOpacity
          onPress={() => handleViewLocalInstitutionDetails(item)}
          activeOpacity={0.9}>
          <Card
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderLeftWidth: 4,
                borderLeftColor: item.status === 'paid' ? colors.success : colors.accent,
              },
            ]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.headerRow}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color={colors.secondary}
                  style={styles.icon}
                />
                <View style={styles.titleContainer}>
                  <Text
                    style={[styles.groupName, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.groupName}
                  </Text>
                  <Text
                    style={[styles.details, { color: colors.secondaryText }]}>
                    ${(weeklyAmount).toFixed(2)} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • Week {item.weekNumber}
                  </Text>
                </View>
                {renderLocalInstitutionStatusChip(item.status)}
              </View>

              <View style={styles.footerRow}>
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={14}
                    color={colors.secondaryText}
                  />
                  <Text
                    style={[styles.dateText, { color: colors.secondaryText }]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.amountContainer,
                    {
                      backgroundColor: totalPayments >= expectedAmount
                        ? `${colors.success}20`
                        : `${colors.accent}20`,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.amountText,
                      { color: totalPayments >= expectedAmount ? colors.success : colors.accent },
                    ]}>
                    ${(weeklyAmount * item.weekNumber).toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <IconButton
                icon="pencil"
                size={18}
                onPress={() => handleEditLocalInstitution(item)}
                iconColor={colors.secondary}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={18}
                onPress={() => handleDeleteLocalInstitution(item.id)}
                iconColor={colors.error}
                style={styles.actionButton}
              />
            </Card.Actions>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderInstitutionalBankItem = ({ item, index }) => {
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100).duration(300)}
        key={item.id}>
        <TouchableOpacity
          onPress={() => handleViewInstitutionalBankDetails(item)}
          activeOpacity={0.9}>
          <Card
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              },
            ]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.headerRow}>
                <MaterialCommunityIcons
                  name="bank"
                  size={20}
                  color={colors.secondary}
                  style={styles.icon}
                />
                <View style={styles.titleContainer}>
                  <Text
                    style={[styles.bankName, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.bankName}
                  </Text>
                  <Text
                    style={[styles.details, { color: colors.secondaryText }]}>
                    {item.accountType} • ${parseFloat(item.balance || 0).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={14}
                    color={colors.secondaryText}
                  />
                  <Text
                    style={[styles.dateText, { color: colors.secondaryText }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.balanceContainer,
                    {
                      backgroundColor: `${colors.primary}20`,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.balanceText,
                      { color: colors.primary },
                    ]}>
                    Balance: ${parseFloat(item.balance || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <IconButton
                icon="pencil"
                size={18}
                onPress={() => handleEditInstitutionalBank(item)}
                iconColor={colors.secondary}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={18}
                onPress={() => handleDeleteInstitutionalBank(item.id)}
                iconColor={colors.error}
                style={styles.actionButton}
              />
            </Card.Actions>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const filteredLocalInstitutions = localInstitutions.filter((institution) =>
    institution.groupName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstitutionalBanks = institutionalBanks.filter((bank) =>
    bank.bankName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentData = activeTab === 'local' ? filteredLocalInstitutions : filteredInstitutionalBanks;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
        <Searchbar
          placeholder="Search banks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: colors.surface }]}
          iconColor={colors.secondaryText}
          inputStyle={{ color: colors.text }}
        />
        
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            {
              value: 'local',
              label: 'Local Groups',
              icon: 'account-group',
            },
            {
              value: 'institutional',
              label: 'Banks',
              icon: 'bank',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </Animated.View>

      <FlatList
        data={currentData}
        renderItem={activeTab === 'local' ? renderLocalInstitutionItem : renderInstitutionalBankItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          if (activeTab === 'local') {
            navigation.navigate('LocalInstitutionForm');
          } else {
            navigation.navigate('InstitutionalBankForm');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    gap: 16,
  },
  searchbar: {
    elevation: 2,
    borderRadius: 12,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  amountContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  balanceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    justifyContent: 'flex-end',
    paddingTop: 0,
  },
  actionButton: {
    margin: 0,
  },
  chip: {
    height: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default BankListScreen; 