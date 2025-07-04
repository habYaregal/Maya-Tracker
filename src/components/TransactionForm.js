import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import {
  Button,
  Card,
  TextInput,
  Text,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveTransaction } from '../services/database';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const TransactionForm = ({ navigation, route }) => {
  const { transaction: editTransaction } = route.params || {};
  const [transaction, setTransaction] = useState({
    productName: editTransaction?.productName || '',
    quantity: editTransaction?.quantity?.toString() || '',
    unitPrice: editTransaction?.unitPrice?.toString() || '',
    moneyPaid: editTransaction?.moneyPaid?.toString() || '',
    status: editTransaction?.status || 'buying',
    otherExpenses: editTransaction?.otherExpenses?.toString() || '',
    date: editTransaction?.date || new Date().toISOString().split('T')[0],
    soldPrice: editTransaction?.soldPrice?.toString() || '',
    moneyReceived: editTransaction?.moneyReceived?.toString() || '',
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  const handleChange = (field, value) => {
    setTransaction((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!transaction.productName.trim()) newErrors.productName = 'Product name is required';
    if (!transaction.quantity || isNaN(transaction.quantity) || parseFloat(transaction.quantity) <= 0)
      newErrors.quantity = 'Valid positive quantity required';
    if (!transaction.unitPrice || isNaN(transaction.unitPrice) || parseFloat(transaction.unitPrice) <= 0)
      newErrors.unitPrice = 'Valid positive bought price required';
    if (transaction.status === 'sold' && (!transaction.soldPrice || isNaN(transaction.soldPrice)))
      newErrors.soldPrice = 'Sold price is required for sold status';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const processedTransaction = {
          ...transaction,
          id: editTransaction ? editTransaction.id : undefined,
          quantity: parseFloat(transaction.quantity) || 0,
          unitPrice: parseFloat(transaction.unitPrice) || 0,
          moneyPaid: parseFloat(transaction.moneyPaid) || 0,
          otherExpenses: parseFloat(transaction.otherExpenses) || 0,
          soldPrice: parseFloat(transaction.soldPrice) || 0,
          moneyReceived: parseFloat(transaction.moneyReceived) || 0,
        };
        await saveTransaction(processedTransaction);
        navigation.navigate('TransactionList', { refresh: true });
      } catch (error) {
        console.error('Error saving transaction:', error);
        setErrors({ submit: 'Failed to save transaction' });
      }
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) handleChange('date', selectedDate.toISOString().split('T')[0]);
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
              title={editTransaction ? 'Edit Transaction' : 'Add Transaction'}
              titleStyle={[styles.title, { color: colors.text }]}
            />
            <Card.Content>
              {/* Product Name */}
              <Animated.View entering={FadeInDown.delay(100)}>
                <TextInput
                  label="የእህል አይነት"
                  value={transaction.productName}
                  onChangeText={(text) => handleChange('productName', text)}
                  error={!!errors.productName}
                  style={[styles.input, { backgroundColor: colors.background }]}
                  theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                  allowFontScaling={false}
                  mode="outlined"
                />
                <HelperText type="error" visible={!!errors.productName} style={{ color: colors.error }}>
                  {errors.productName}
                </HelperText>
              </Animated.View>

              {/* Quantity and Unit Price */}
              <View style={styles.row}>
                <Animated.View entering={FadeInDown.delay(200)} style={{ flex: 1 }}>
                  <TextInput
                    label="ብዛት (ኩንታል)"
                    value={transaction.quantity}
                    onChangeText={(text) => handleChange('quantity', text)}
                    keyboardType="numeric"
                    error={!!errors.quantity}
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                    allowFontScaling={false}
                    mode="outlined"
                    placeholder="e.g., 10"
                  />
                  <HelperText type="error" visible={!!errors.quantity} style={{ color: colors.error }}>
                    {errors.quantity}
                  </HelperText>
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(300)} style={{ flex: 1 }}>
                  <TextInput
                    label="የተገዛበት (በኩንታል)"
                    value={transaction.unitPrice}
                    onChangeText={(text) => handleChange('unitPrice', text)}
                    keyboardType="numeric"
                    error={!!errors.unitPrice}
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                    allowFontScaling={false}
                    mode="outlined"
                    placeholder="e.g., 50.00"
                  />
                  <HelperText type="error" visible={!!errors.unitPrice} style={{ color: colors.error }}>
                    {errors.unitPrice}
                  </HelperText>
                </Animated.View>
              </View>

              {/* Money Paid and Other Expenses */}
              <View style={styles.row}>
                <Animated.View entering={FadeInDown.delay(400)} style={{ flex: 1 }}>
                  <TextInput
                    label="የተከፈለ ገንዘብ ($)"
                    value={transaction.moneyPaid}
                    onChangeText={(text) => handleChange('moneyPaid', text)}
                    keyboardType="numeric"
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, text: colors.text } }}
                    allowFontScaling={false}
                    mode="outlined"
                    placeholder="e.g., 500.00"
                  />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(500)} style={{ flex: 1 }}>
                  <TextInput
                    label="ተጨማሪ ወጭዎች($)"
                    value={transaction.otherExpenses}
                    onChangeText={(text) => handleChange('otherExpenses', text)}
                    keyboardType="numeric"
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, text: colors.text } }}
                    allowFontScaling={false}
                    mode="outlined"
                    placeholder="e.g., 100.00"
                  />
                </Animated.View>
              </View>

              {/* Status Card Selector */}
              <Animated.View entering={FadeInDown.delay(600)}>
                <Text style={[styles.label, { color: colors.text }]}>Transaction Type</Text>
                <View style={styles.cardSelectorContainer}>
                  {[
                    {
                      status: 'buying',
                      icon: 'cart-arrow-down',
                      label: 'Buying',
                      desc: 'Purchasing inventory',
                      color: colors.secondary,
                    },
                    {
                      status: 'selling',
                      icon: 'cart-outline',
                      label: 'Selling',
                      desc: 'Currently on sale',
                      color: colors.accent,
                    },
                    {
                      status: 'sold',
                      icon: 'check-circle',
                      label: 'Sold',
                      desc: 'Completed sale',
                      color: colors.success,
                    },
                  ].map((item) => (
                    <Pressable
                      key={item.status}
                      onPress={() => handleChange('status', item.status)}
                      style={({ pressed }) => [
                        styles.statusCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: transaction.status === item.status ? item.color : colors.background,
                          opacity: pressed ? 0.8 : 1,
                          transform: [{ scale: pressed ? 0.98 : 1 }],
                        },
                      ]}
                    >
                      <View style={[styles.statusIconContainer, { backgroundColor: `${item.color}20` }]}>
                        <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                      </View>
                      <View style={styles.statusTextContainer}>
                        <Text style={[styles.statusLabel, { color: colors.text }]}>{item.label}</Text>
                        <Text style={[styles.statusDesc, { color: colors.secondaryText }]}>{item.desc}</Text>
                      </View>
                      {transaction.status === item.status && (
                        <View style={[styles.statusBadge, { backgroundColor: item.color }]}>
                          <MaterialCommunityIcons name="check" size={16} color={colors.surface} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </Animated.View>

              {/* Conditional Fields */}
              {(transaction.status === 'selling' || transaction.status === 'sold') && (
                <Animated.View entering={FadeInDown.delay(700)}>
                  <TextInput
                    label="የተሸጠበት (በኩንታል)"
                    value={transaction.soldPrice}
                    onChangeText={(text) => handleChange('soldPrice', text)}
                    keyboardType="numeric"
                    error={!!errors.soldPrice}
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                    allowFontScaling={false}
                    mode="outlined"
                    placeholder="e.g., 60.00"
                  />
                  <HelperText type="error" visible={!!errors.soldPrice} style={{ color: colors.error }}>
                    {errors.soldPrice}
                  </HelperText>
                </Animated.View>
              )}

              {transaction.status === 'sold' && (
                <Animated.View entering={FadeInDown.delay(800)}>
                  <TextInput
                    label="የተቀበለ ገንዘብ ($)"
                    value={transaction.moneyReceived}
                    onChangeText={(text) => handleChange('moneyReceived', text)}
                    keyboardType="numeric"
                    error={!!errors.moneyReceived}
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                    allowFontScaling={false}
                    mode="outlined"
                    placeholder="e.g., 600.00"
                  />
                  <HelperText type="error" visible={!!errors.moneyReceived} style={{ color: colors.error }}>
                    {errors.moneyReceived}
                  </HelperText>
                </Animated.View>
              )}

              {/* Date Picker */}
              <Animated.View entering={FadeInDown.delay(900)}>
                <TextInput
                  label="Date"
                  value={transaction.date}
                  onFocus={() => setShowDatePicker(true)}
                  style={[styles.input, { backgroundColor: colors.background }]}
                  theme={{ colors: { primary: colors.primary, text: colors.text } }}
                  allowFontScaling={false}
                  mode="outlined"
                />
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(transaction.date)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </Animated.View>

              {/* Submit Button */}
              <Animated.View entering={FadeInDown.delay(1000)}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.button, { borderRadius: 12 }]}
                  labelStyle={{ color: colors.text, fontSize: 16, allowFontScaling: false }}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  {editTransaction ? 'Update' : 'Save'}
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
    allowFontScaling: false,
  },
  input: {
    marginBottom: 12,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    allowFontScaling: false,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  // Status Card Selector Styles
  cardSelectorContainer: {
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 12,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionForm;