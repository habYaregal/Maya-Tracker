import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme, IconButton } from 'react-native-paper';
import TransactionList from '../components/TransactionList';
import { fetchTransactions, deleteTransaction } from '../services/database';
import { ThemeContext } from '../utils/ThemeContext';

const TransactionListScreen = ({ navigation, route }) => {
  const [transactions, setTransactions] = useState([]);
  const { colors } = useTheme();
  const { toggleTheme } = useContext(ThemeContext);
  const { refresh } = route.params || {};

  useEffect(() => {
    const loadTransactions = async () => {
      const fetchedTransactions = await fetchTransactions();
      setTransactions(fetchedTransactions);
    };
    loadTransactions();
  }, [refresh]);

  const handleEdit = (transaction) => {
    navigation.navigate('TransactionForm', { transaction });
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleViewDetails = (transaction) => {
    navigation.navigate('TransactionDetails', { transaction });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('TransactionForm')}
          style={styles.addButton}
          labelStyle={{ color: colors.text }}
        >
          Add Transaction
        </Button>
        <IconButton
          icon="theme-light-dark"
          size={24}
          onPress={toggleTheme}
          iconColor={colors.text}
        />
      </View>
      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
});

export default TransactionListScreen;