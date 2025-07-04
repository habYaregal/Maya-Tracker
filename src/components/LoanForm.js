import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Button,
  Card,
  TextInput,
  RadioButton,
  Text,
  HelperText,
  useTheme,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveLoan, addLoanPayment } from '../services/database';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const LoanForm = ({ navigation, route }) => {
  const { loan: editLoan } = route.params || {};
  const [loan, setLoan] = useState({
    type: editLoan?.type || 'given',
    partyName: editLoan?.partyName || '',
    amount: editLoan?.amount?.toString() || '',
    status: editLoan?.status || 'active',
    date: editLoan?.date || new Date().toISOString().split('T')[0],
    payments: editLoan?.payments || [],
  });
  const [payment, setPayment] = useState('');
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  const handleChange = (field, value) => {
    setLoan((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!loan.partyName.trim()) newErrors.partyName = 'Party name is required';
    if (!loan.amount || isNaN(loan.amount) || parseFloat(loan.amount) <= 0)
      newErrors.amount = 'Valid positive amount required';
    if (!loan.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const processedLoan = {
        id: editLoan?.id,
        type: loan.type,
        partyName: loan.partyName.trim(),
        amount: parseFloat(loan.amount),
        status: loan.status,
        date: loan.date,
        payments: loan.payments,
      };
      const savedLoan = await saveLoan(processedLoan);
      console.log('Loan saved successfully:', savedLoan);
      navigation.replace('LoanList', { refresh: Date.now() });
    } catch (error) {
      console.error('Error saving loan:', error.message);
      setErrors({ submit: 'Failed to save loan. Please try again.' });
    }
  };

  const handleAddPayment = async () => {
    if (!payment || isNaN(payment) || parseFloat(payment) <= 0) {
      setErrors({ payment: 'Valid positive payment amount required' });
      return;
    }
    try {
      const paymentData = {
        amount: parseFloat(payment),
        date: new Date().toISOString().split('T')[0],
      };
      const updatedLoan = await addLoanPayment(editLoan.id, paymentData);
      setLoan((prev) => ({ ...prev, payments: updatedLoan.payments }));
      setPayment('');
      setErrors({});
      console.log('Payment added successfully:', paymentData);
    } catch (error) {
      console.error('Error adding payment:', error);
      setErrors({ payment: 'Failed to add payment. Please try again.' });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('date', selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Title
              title={editLoan ? 'Edit Loan' : 'Add Loan'}
              titleStyle={[styles.title, { color: colors.text }]}
            />
            <Card.Content>
              <Animated.View entering={FadeInDown.delay(100)}>
                <Text style={[styles.label, { color: colors.text }]}>Loan Type</Text>
                <RadioButton.Group
                  value={loan.type}
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <View style={styles.radioRow}>
                    {['given', 'taken'].map((type) => (
                      <RadioButton.Item
                        key={type}
                        label={type.charAt(0).toUpperCase() + type.slice(1)}
                        value={type}
                        color={colors.primary}
                        labelStyle={{ color: colors.text, fontSize: 16 }}
                      />
                    ))}
                  </View>
                </RadioButton.Group>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(200)}>
                <TextInput
                  label="Party Name"
                  value={loan.partyName}
                  onChangeText={(text) => handleChange('partyName', text)}
                  error={!!errors.partyName}
                  style={[styles.input, { backgroundColor: colors.background }]}
                  theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                  mode="outlined"
                />
                <HelperText type="error" visible={!!errors.partyName} style={{ color: colors.error }}>
                  {errors.partyName}
                </HelperText>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(300)}>
                <TextInput
                  label="Amount ($)"
                  value={loan.amount}
                  onChangeText={(text) => handleChange('amount', text)}
                  keyboardType="numeric"
                  error={!!errors.amount}
                  style={[styles.input, { backgroundColor: colors.background }]}
                  theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                  mode="outlined"
                  placeholder="e.g., 500.00"
                />
                <HelperText type="error" visible={!!errors.amount} style={{ color: colors.error }}>
                  {errors.amount}
                </HelperText>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(400)}>
                <Text style={[styles.label, { color: colors.text }]}>Status</Text>
                <RadioButton.Group
                  value={loan.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <View style={styles.radioRow}>
                    {['active', 'paid'].map((status) => (
                      <RadioButton.Item
                        key={status}
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        value={status}
                        color={colors.primary}
                        labelStyle={{ color: colors.text, fontSize: 16 }}
                      />
                    ))}
                  </View>
                </RadioButton.Group>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(500)}>
                <TextInput
                  label="Date"
                  value={loan.date}
                  onFocus={() => setShowDatePicker(true)}
                  style={[styles.input, { backgroundColor: colors.background }]}
                  theme={{ colors: { primary: colors.primary, text: colors.text } }}
                  mode="outlined"
                />
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(loan.date)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
                <HelperText type="error" visible={!!errors.date} style={{ color: colors.error }}>
                  {errors.date}
                </HelperText>
              </Animated.View>

              {editLoan && (
                <Animated.View entering={FadeInDown.delay(600)}>
                  <TextInput
                    label={loan.type === 'given' ? 'Payment Received ($)' : 'Payment Made ($)'}
                    value={payment}
                    onChangeText={setPayment}
                    keyboardType="numeric"
                    error={!!errors.payment}
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                    mode="outlined"
                    placeholder="e.g., 100.00"
                  />
                  <HelperText type="error" visible={!!errors.payment} style={{ color: colors.error }}>
                    {errors.payment}
                  </HelperText>
                  <Button
                    mode="contained"
                    onPress={handleAddPayment}
                    style={[styles.button, { borderRadius: 12 }]}
                    labelStyle={{ color: colors.text }}
                  >
                    Add Payment
                  </Button>
                </Animated.View>
              )}

              <Animated.View entering={FadeInDown.delay(700)}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.button, { borderRadius: 12 }]}
                  labelStyle={{ color: colors.text }}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  {editLoan ? 'Update' : 'Save'}
                </Button>
                {errors.submit && (
                  <HelperText type="error" visible={true} style={{ color: colors.error }}>
                    {errors.submit}
                  </HelperText>
                )}
              </Animated.View>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
    borderRadius: 8,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    overflow: 'hidden',
  },
});

export default LoanForm;