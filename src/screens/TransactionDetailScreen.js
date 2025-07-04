import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const TransactionDetailScreen = ({ route }) => {
  const { transaction } = route.params || {};
  const { colors } = useTheme();

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>No transaction data available</Text>
      </View>
    );
  }

  const totalCost = parseFloat(transaction.unitPrice) * parseFloat(transaction.quantity) + parseFloat(transaction.otherExpenses || 0);
  const profit =
    transaction.status === 'sold' && transaction.soldPrice
      ? parseFloat(transaction.quantity) * parseFloat(transaction.soldPrice) - totalCost
      : 0;
  const moneyToBePaid =
    transaction.status === 'buying'
      ? parseFloat(transaction.quantity) * parseFloat(transaction.unitPrice) - parseFloat(transaction.moneyPaid || 0)
      : 0;
  const moneyToBeReceived =
    (transaction.status === 'selling' || transaction.status === 'sold') && transaction.soldPrice
      ? parseFloat(transaction.quantity) * parseFloat(transaction.soldPrice) - parseFloat(transaction.moneyReceived || 0)
      : 0;

  const renderStatusChip = () => {
    const statusConfig = {
      buying: { color: colors.secondary, icon: 'cart-arrow-down' },
      selling: { color: colors.accent, icon: 'cart-outline' },
      sold: { color: colors.success, icon: 'check' },
      default: { color: colors.primary, icon: 'cart' },
    };

    const { color, icon } = statusConfig[transaction.status] || statusConfig.default;

    return (
      <Chip
        icon={({ size }) => <MaterialCommunityIcons name={icon} size={14} color={colors.surface} />}
        style={[styles.chip, { backgroundColor: color, borderColor: colors.primary, borderWidth: 0.5 }]}
        textStyle={{ color: colors.surface, fontSize: 12, fontWeight: '600' }}
      >
        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
      </Chip>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View entering={FadeInDown.duration(300)}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>{transaction.productName}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
            {transaction.quantity} quintals • ${parseFloat(transaction.unitPrice).toFixed(2)} each
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100)}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="cube-outline" size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Status</Text>
                {renderStatusChip()}
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Date</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="cash" size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Total Cost</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  ${(parseFloat(transaction.unitPrice) * parseFloat(transaction.quantity)).toFixed(2)}
                </Text>
              </View>
            </View>

            {transaction.otherExpenses > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="cash-plus" size={20} color={colors.secondary} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Other Expenses</Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    ${parseFloat(transaction.otherExpenses).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {moneyToBePaid > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="cash-minus" size={20} color={colors.error} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Money to be Paid</Text>
                  <Text style={[styles.value, { color: colors.error }]}>
                    ${moneyToBePaid.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {moneyToBeReceived > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="cash-check" size={20} color={colors.success} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Money to be Received</Text>
                  <Text style={[styles.value, { color: colors.success }]}>
                    ${moneyToBeReceived.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {transaction.status === 'sold' && transaction.soldPrice && (
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={profit >= 0 ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={profit >= 0 ? colors.success : colors.error}
                  />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Profit</Text>
                  <Text
                    style={[
                      styles.value,
                      { color: profit >= 0 ? colors.success : colors.error },
                    ]}
                  >
                    {profit >= 0 ? '↑' : '↓'} ${Math.abs(profit).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerGradient: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(75, 134, 180, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  chip: {
    borderRadius: 12,
    height: 26,
    paddingHorizontal: 6,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TransactionDetailScreen;