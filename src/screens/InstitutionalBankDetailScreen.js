import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  IconButton,
  Button,
  useTheme,
  Divider,
  List,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  fetchInstitutionalBanks,
  addBankTransaction,
  deleteInstitutionalBank
} from '../services/database';
import { ThemeContext } from '../utils/ThemeContext';

const InstitutionalBankDetailScreen = ({ navigation, route }) => {
  const { bank: initialBank } = route.params;
  const [bank, setBank] = useState(initialBank);
  const { colors } = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const loadBank = async () => {
      const banks = await fetchInstitutionalBanks();
      const updatedBank = banks.find(b => b.id === initialBank.id);
      if (updatedBank) {
        setBank(updatedBank);
      }
    };
    loadBank();
  }, [initialBank.id]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const loadBank = async () => {
        const banks = await fetchInstitutionalBanks();
        const updatedBank = banks.find(b => b.id === initialBank.id);
        if (updatedBank) {
          setBank(updatedBank);
        }
      };
      loadBank();
    });

    return unsubscribe;
  }, [navigation, initialBank.id]);

  const handleEdit = () => {
    navigation.navigate('InstitutionalBankForm', { bank });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bank Account',
      `Are you sure you want to delete "${bank.bankName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteInstitutionalBank(bank.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddTransaction = () => {
    navigation.navigate('BankTransactionForm', { bank });
  };

  const getAccountTypeIcon = (type) => {
    const icons = {
      savings: 'piggy-bank',
      checking: 'credit-card',
      business: 'briefcase',
    };
    return icons[type] || 'bank';
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      savings: '#22C55E',
      checking: '#3B82F6',
      business: '#8B5CF6',
    };
    return colors[type] || colors.primary;
  };

  const totalTransactions = bank.transactions.reduce(
    (sum, t) => sum + parseFloat(t.amount || 0),
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Animated.View entering={FadeInUp.duration(500)}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.headerRow}>
                <MaterialCommunityIcons
                  name="bank"
                  size={32}
                  color={colors.primary}
                />
                <View style={styles.headerText}>
                  <Text style={[styles.bankName, { color: colors.text }]}>
                    {bank.bankName}
                  </Text>
                  <Text style={[styles.accountType, { color: colors.secondaryText }]}>
                    {bank.accountType.charAt(0).toUpperCase() + bank.accountType.slice(1)} Account
                  </Text>
                </View>
                <Chip
                  icon={({ size }) => (
                    <MaterialCommunityIcons
                      name={getAccountTypeIcon(bank.accountType)}
                      size={14}
                      color={colors.surface}
                    />
                  )}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: getAccountTypeColor(bank.accountType),
                      borderColor: colors.primary,
                      borderWidth: 0.5,
                    },
                  ]}
                  textStyle={{ color: colors.surface, fontSize: 12, fontWeight: '600' }}>
                  {bank.accountType.charAt(0).toUpperCase() + bank.accountType.slice(1)}
                </Chip>
              </View>

              <Divider style={[styles.divider, { backgroundColor: colors.outline }]} />

              {/* Financial Summary */}
              <View style={styles.summaryContainer}>
                <View style={styles.balanceContainer}>
                  <Text style={[styles.balanceLabel, { color: colors.secondaryText }]}>
                    Current Balance
                  </Text>
                  <Text style={[styles.balanceValue, { color: colors.primary }]}>
                    ${parseFloat(bank.balance || 0).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                      Total Transactions
                    </Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {bank.transactions.length}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                      Transaction Value
                    </Text>
                    <Text style={[styles.statValue, { color: colors.secondary }]}>
                      ${totalTransactions.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Details Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Title
              title="Account Details"
              titleStyle={[styles.cardTitle, { color: colors.text }]}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="information"
                  size={24}
                  color={colors.primary}
                />
              )}
            />
            <Card.Content>
              <List.Item
                title="Bank Name"
                description={bank.bankName}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name="bank"
                    size={20}
                    color={colors.secondary}
                  />
                )}
                titleStyle={[styles.listTitle, { color: colors.text }]}
                descriptionStyle={[styles.listDescription, { color: colors.secondaryText }]}
              />
              <List.Item
                title="Account Type"
                description={bank.accountType.charAt(0).toUpperCase() + bank.accountType.slice(1)}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name={getAccountTypeIcon(bank.accountType)}
                    size={20}
                    color={getAccountTypeColor(bank.accountType)}
                  />
                )}
                titleStyle={[styles.listTitle, { color: colors.text }]}
                descriptionStyle={[styles.listDescription, { color: colors.secondaryText }]}
              />
              <List.Item
                title="Created Date"
                description={new Date(bank.createdAt).toLocaleDateString()}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name="calendar"
                    size={20}
                    color={colors.secondary}
                  />
                )}
                titleStyle={[styles.listTitle, { color: colors.text }]}
                descriptionStyle={[styles.listDescription, { color: colors.secondaryText }]}
              />
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Transactions Card */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Title
              title={`Transaction History (${bank.transactions.length})`}
              titleStyle={[styles.cardTitle, { color: colors.text }]}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="cash-multiple"
                  size={24}
                  color={colors.primary}
                />
              )}
            />
            <Card.Content>
              {bank.transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="cash-remove"
                    size={48}
                    color={colors.secondaryText}
                  />
                  <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                    No transactions recorded yet
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                    Add your first transaction to get started
                  </Text>
                </View>
              ) : (
                bank.transactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((transaction, index) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={styles.transactionHeader}>
                        <View style={[
                          styles.transactionIconContainer,
                          { backgroundColor: transaction.type === 'deposit' ? colors.success : colors.error }
                        ]}>
                          <MaterialCommunityIcons
                            name={transaction.type === 'deposit' ? 'cash-plus' : 'cash-minus'}
                            size={20}
                            color={colors.surface}
                          />
                        </View>
                        <View style={styles.transactionInfo}>
                          <Text style={[styles.transactionType, { color: colors.text }]}>
                            {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                          </Text>
                          <Text style={[styles.transactionDate, { color: colors.secondaryText }]}>
                            {new Date(transaction.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.transactionAmount}>
                          <Text style={[
                            styles.amountText,
                            { 
                              color: transaction.type === 'deposit' ? colors.success : colors.error 
                            }
                          ]}>
                            {transaction.type === 'deposit' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                      {transaction.description && (
                        <Text style={[styles.transactionDescription, { color: colors.secondaryText }]}>
                          {transaction.description}
                        </Text>
                      )}
                      {index < bank.transactions.length - 1 && (
                        <Divider style={[styles.transactionDivider, { backgroundColor: colors.outline }]} />
                      )}
                    </View>
                  ))
              )}
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={handleAddTransaction}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.surface }}
            icon="plus"
          >
            Add Transaction
          </Button>
        </Animated.View>
      </ScrollView>

      {/* FAB for quick actions */}
      <FAB
        icon="dots-horizontal"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          Alert.alert(
            'Actions',
            'Choose an action',
            [
              { text: 'Edit', onPress: handleEdit },
              { text: 'Delete', onPress: handleDelete, style: 'destructive' },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  bankName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  summaryContainer: {
    marginTop: 8,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  listDescription: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
  transactionItem: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDescription: {
    fontSize: 12,
    marginLeft: 44,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  transactionDivider: {
    marginTop: 8,
  },
  actionContainer: {
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 8,
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

export default InstitutionalBankDetailScreen; 