import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const TransactionList = ({ transactions = [], onEdit, onDelete, onViewDetails }) => {
  const theme = useTheme();
  const { colors } = theme;

  const renderStatusChip = (status) => {
    const statusConfig = {
      buying: { color: colors.secondary, icon: 'cart-arrow-down' },
      selling: { color: colors.accent, icon: 'cart-outline' },
      sold: { color: colors.success, icon: 'check' },
      default: { color: colors.primary, icon: 'cart' },
    };

    const { color, icon } = statusConfig[status] || statusConfig.default;

    return (
      <Chip
        icon={({ size }) => (
          <MaterialCommunityIcons name={icon} size={14} color={colors.surface} />
        )}
        style={[
          styles.chip,
          {
            backgroundColor: color,
            borderColor: colors.primary,
            borderWidth: 0.5,
          },
        ]}
        textStyle={{
          color: colors.surface,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  const renderItem = ({ item, index }) => {
    const totalCost = parseFloat(item.unitPrice) * parseFloat(item.quantity) + parseFloat(item.otherExpenses || 0);
    const profit =
      item.status === 'sold' && item.soldPrice
        ? parseFloat(item.quantity) * parseFloat(item.soldPrice) - totalCost
        : 0;

    return (
      <Animated.View entering={FadeInUp.delay(index * 100).duration(300)} key={item.id}>
        <TouchableOpacity onPress={() => onViewDetails(item)} activeOpacity={0.9}>
          <Card
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderLeftWidth: 4,
                borderLeftColor:
                  item.status === 'sold'
                    ? profit >= 0
                      ? colors.success
                      : colors.error
                    : item.status === 'buying'
                    ? colors.secondary
                    : colors.accent,
              },
            ]}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.headerRow}>
                <MaterialCommunityIcons
                  name="cube-outline"
                  size={20}
                  color={colors.secondary}
                  style={styles.productIcon}
                />
                <View style={styles.titleContainer}>
                  <Text
                    style={[styles.productName, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.productName}
                  </Text>
                  <Text style={[styles.productDetails, { color: colors.secondaryText }]}>
                    {item.quantity} quintals • ${parseFloat(item.unitPrice).toFixed(2)} each
                  </Text>
                </View>
                {renderStatusChip(item.status)}
              </View>

              <View style={styles.footerRow}>
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons name="calendar" size={14} color={colors.secondaryText} />
                  <Text style={[styles.dateText, { color: colors.secondaryText }]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                {item.status === 'sold' && item.soldPrice && (
                  <View
                    style={[
                      styles.profitContainer,
                      {
                        backgroundColor: profit >= 0 ? `${colors.success}20` : `${colors.error}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.profitText,
                        {
                          color: profit >= 0 ? colors.success : colors.error,
                        },
                      ]}
                    >
                      {profit >= 0 ? '↑' : '↓'} ${Math.abs(profit).toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <IconButton
                icon="pencil"
                size={18}
                onPress={() => onEdit(item)}
                iconColor={colors.secondary}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={18}
                onPress={() => onDelete(item.id)}
                iconColor={colors.error}
                style={styles.actionButton}
              />
              <View style={styles.spacer} />
              <Text style={[styles.totalText, { color: colors.text }]}>
                Total: ${(parseFloat(item.unitPrice) * parseFloat(item.quantity)).toFixed(2)}
              </Text>
            </Card.Actions>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.list,
        {
          paddingBottom: theme.spacing.large,
          paddingHorizontal: theme.spacing.medium,
        },
      ]}
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productIcon: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    marginLeft: 4,
  },
  profitContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  profitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chip: {
    borderRadius: 12,
    height: 26,
    paddingHorizontal: 6,
  },
  actions: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'space-between',
  },
  actionButton: {
    margin: 0,
  },
  spacer: {
    flex: 1,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  list: {
    paddingTop: 8,
  },
});

export default TransactionList;