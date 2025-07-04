import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  SegmentedButtons,
  useTheme,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { addBankTransaction, updateBankBalance } from '../services/database';

const BankTransactionForm = ({ route, navigation }) => {
  const { bank } = route.params;
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState('deposit');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (transactionType === 'withdrawal' && numAmount > bank.balance) {
      Alert.alert('Error', 'Insufficient balance for withdrawal');
      return;
    }

    setLoading(true);
    try {
      const transaction = {
        id: `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bankId: bank.id,
        type: transactionType,
        amount: numAmount,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };

      // Add transaction
      await addBankTransaction(transaction);

      // Update bank balance
      const newBalance = transactionType === 'deposit' 
        ? bank.balance + numAmount 
        : bank.balance - numAmount;
      
      await updateBankBalance(bank.id, newBalance);

      Alert.alert(
        'Success',
        `${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} added successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Title style={[styles.headerTitle, { color: colors.surface }]}>
          {bank.bankName}
        </Title>
        <Paragraph style={[styles.headerSubtitle, { color: colors.surface }]}>
          Current Balance: ${bank.balance.toFixed(2)}
        </Paragraph>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: colors.text }]}>
              New Transaction
            </Title>

            <SegmentedButtons
              value={transactionType}
              onValueChange={setTransactionType}
              buttons={[
                {
                  value: 'deposit',
                  label: 'Deposit',
                  icon: 'plus',
                  checkedColor: colors.success,
                },
                {
                  value: 'withdrawal',
                  label: 'Withdrawal',
                  icon: 'minus',
                  checkedColor: colors.error,
                },
              ]}
              style={styles.segmentedButtons}
            />

            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              left={<TextInput.Affix text="$" />}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
            />

            <View style={styles.summaryContainer}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                Transaction Summary
              </Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                  Type:
                </Text>
                <Text style={[
                  styles.summaryValue,
                  { color: transactionType === 'deposit' ? colors.success : colors.error }
                ]}>
                  {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                  Amount:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${amount || '0.00'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                  New Balance:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${(() => {
                    const numAmount = parseFloat(amount) || 0;
                    const newBalance = transactionType === 'deposit' 
                      ? bank.balance + numAmount 
                      : bank.balance - numAmount;
                    return newBalance.toFixed(2);
                  })()}
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !amount || !description.trim()}
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  marginTop: 16,
                },
              ]}
              labelStyle={styles.submitButtonLabel}
            >
              Add Transaction
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  summaryContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BankTransactionForm; 