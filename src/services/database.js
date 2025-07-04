import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTION_KEY = '@transactions';
const LOAN_KEY = '@loans';
const LOCAL_INSTITUTION_KEY = '@local_institutions';
const INSTITUTIONAL_BANK_KEY = '@institutional_banks';

export const initializeStorage = async () => {
  try {
    const transactions = await AsyncStorage.getItem(TRANSACTION_KEY);
    const loans = await AsyncStorage.getItem(LOAN_KEY);
    const localInstitutions = await AsyncStorage.getItem(LOCAL_INSTITUTION_KEY);
    const institutionalBanks = await AsyncStorage.getItem(INSTITUTIONAL_BANK_KEY);
    
    if (transactions === null) {
      await AsyncStorage.setItem(TRANSACTION_KEY, JSON.stringify([]));
      console.log('Initialized transaction storage');
    }
    if (loans === null) {
      await AsyncStorage.setItem(LOAN_KEY, JSON.stringify([]));
      console.log('Initialized loan storage');
    }
    if (localInstitutions === null) {
      await AsyncStorage.setItem(LOCAL_INSTITUTION_KEY, JSON.stringify([]));
      console.log('Initialized local institution storage');
    }
    if (institutionalBanks === null) {
      await AsyncStorage.setItem(INSTITUTIONAL_BANK_KEY, JSON.stringify([]));
      console.log('Initialized institutional bank storage');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw new Error('Failed to initialize storage');
  }
};

// Transaction Functions
export const saveTransaction = async (transaction) => {
  try {
    await initializeStorage();
    const transactions = await fetchTransactions();
    const newId = transaction.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const updatedTransaction = { ...transaction, id: newId };
    let updatedTransactions;
    const exists = transactions.some((t) => t.id === updatedTransaction.id);
    if (exists) {
      updatedTransactions = transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      );
    } else {
      updatedTransactions = [...transactions, updatedTransaction];
    }
    await AsyncStorage.setItem(TRANSACTION_KEY, JSON.stringify(updatedTransactions));
    console.log('Saved transaction:', updatedTransaction);
    return updatedTransaction;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw new Error('Failed to save transaction');
  }
};

export const fetchTransactions = async () => {
  try {
    await initializeStorage();
    const transactions = await AsyncStorage.getItem(TRANSACTION_KEY);
    const parsed = transactions ? JSON.parse(transactions) : [];
    const validated = parsed.map((t, i) =>
      t.id ? t : { ...t, id: `tx_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}` }
    );
    if (parsed.length !== validated.length || parsed.some((t, i) => t.id !== validated[i].id)) {
      await AsyncStorage.setItem(TRANSACTION_KEY, JSON.stringify(validated));
    }
    console.log('Fetched transactions:', validated);
    return validated;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

export const deleteTransaction = async (id) => {
  try {
    const transactions = await fetchTransactions();
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    await AsyncStorage.setItem(TRANSACTION_KEY, JSON.stringify(updatedTransactions));
    console.log('Deleted transaction ID:', id);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }
};

// Loan Functions
export const saveLoan = async (loan) => {
  try {
    await initializeStorage();
    const loans = await fetchLoans();
    const newId = loan.id || `ln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const updatedLoan = { ...loan, id: newId, payments: loan.payments || [] };
    let updatedLoans;
    const exists = loans.some((l) => l.id === updatedLoan.id);
    if (exists) {
      updatedLoans = loans.map((l) => (l.id === updatedLoan.id ? updatedLoan : l));
    } else {
      updatedLoans = [...loans, updatedLoan];
    }
    await AsyncStorage.setItem(LOAN_KEY, JSON.stringify(updatedLoans));
    console.log('Saved loan:', updatedLoan);
    return updatedLoan;
  } catch (error) {
    console.error('Error saving loan:', error);
    throw new Error('Failed to save loan');
  }
};

export const fetchLoans = async () => {
  try {
    await initializeStorage();
    const loans = await AsyncStorage.getItem(LOAN_KEY);
    const parsed = loans ? JSON.parse(loans) : [];
    const validated = parsed.map((l, i) =>
      l.id ? l : { ...l, id: `ln_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`, payments: l.payments || [] }
    );
    if (parsed.length !== validated.length || parsed.some((l, i) => l.id !== validated[i].id)) {
      await AsyncStorage.setItem(LOAN_KEY, JSON.stringify(validated));
    }
    console.log('Fetched loans:', validated);
    return validated;
  } catch (error) {
    console.error('Error fetching loans:', error);
    throw new Error('Failed to fetch loans');
  }
};

export const deleteLoan = async (id) => {
  try {
    const loans = await fetchLoans();
    const updatedLoans = loans.filter((l) => l.id !== id);
    await AsyncStorage.setItem(LOAN_KEY, JSON.stringify(updatedLoans));
    console.log('Deleted loan ID:', id);
  } catch (error) {
    console.error('Error deleting loan:', error);
    throw new Error('Failed to delete loan');
  }
};

export const addLoanPayment = async (loanId, payment) => {
  try {
    const loans = await fetchLoans();
    const updatedLoans = loans.map((l) =>
      l.id === loanId
        ? { ...l, payments: [...(l.payments || []), { ...payment, id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }] }
        : l
    );
    await AsyncStorage.setItem(LOAN_KEY, JSON.stringify(updatedLoans));
    console.log('Added payment to loan:', { loanId, payment });
    return updatedLoans.find((l) => l.id === loanId);
  } catch (error) {
    console.error('Error adding loan payment:', error);
    throw new Error('Failed to add loan payment');
  }
};

// Local Institution Functions
export const saveLocalInstitution = async (institution) => {
  try {
    await initializeStorage();
    const institutions = await fetchLocalInstitutions();
    const newId = institution.id || `li_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const updatedInstitution = { 
      ...institution, 
      id: newId, 
      payments: institution.payments || [],
      createdAt: institution.createdAt || new Date().toISOString()
    };
    
    let updatedInstitutions;
    const exists = institutions.some((i) => i.id === updatedInstitution.id);
    if (exists) {
      updatedInstitutions = institutions.map((i) => 
        i.id === updatedInstitution.id ? updatedInstitution : i
      );
    } else {
      updatedInstitutions = [...institutions, updatedInstitution];
    }
    
    await AsyncStorage.setItem(LOCAL_INSTITUTION_KEY, JSON.stringify(updatedInstitutions));
    console.log('Saved local institution:', updatedInstitution);
    return updatedInstitution;
  } catch (error) {
    console.error('Error saving local institution:', error);
    throw new Error('Failed to save local institution');
  }
};

export const fetchLocalInstitutions = async () => {
  try {
    await initializeStorage();
    const institutions = await AsyncStorage.getItem(LOCAL_INSTITUTION_KEY);
    const parsed = institutions ? JSON.parse(institutions) : [];
    const validated = parsed.map((i, index) =>
      i.id ? i : { 
        ...i, 
        id: `li_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        payments: i.payments || [],
        createdAt: i.createdAt || new Date().toISOString()
      }
    );
    
    if (parsed.length !== validated.length || parsed.some((i, index) => i.id !== validated[index].id)) {
      await AsyncStorage.setItem(LOCAL_INSTITUTION_KEY, JSON.stringify(validated));
    }
    console.log('Fetched local institutions:', validated);
    return validated;
  } catch (error) {
    console.error('Error fetching local institutions:', error);
    throw new Error('Failed to fetch local institutions');
  }
};

export const deleteLocalInstitution = async (id) => {
  try {
    const institutions = await fetchLocalInstitutions();
    const updatedInstitutions = institutions.filter((i) => i.id !== id);
    await AsyncStorage.setItem(LOCAL_INSTITUTION_KEY, JSON.stringify(updatedInstitutions));
    console.log('Deleted local institution ID:', id);
  } catch (error) {
    console.error('Error deleting local institution:', error);
    throw new Error('Failed to delete local institution');
  }
};

export const addLocalInstitutionPayment = async (institutionId, payment) => {
  try {
    const institutions = await fetchLocalInstitutions();
    const updatedInstitutions = institutions.map((i) =>
      i.id === institutionId
        ? { 
            ...i, 
            payments: [...(i.payments || []), { 
              ...payment, 
              id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              date: payment.date || new Date().toISOString().split('T')[0]
            }] 
          }
        : i
    );
    await AsyncStorage.setItem(LOCAL_INSTITUTION_KEY, JSON.stringify(updatedInstitutions));
    console.log('Added payment to local institution:', { institutionId, payment });
    return updatedInstitutions.find((i) => i.id === institutionId);
  } catch (error) {
    console.error('Error adding local institution payment:', error);
    throw new Error('Failed to add local institution payment');
  }
};

// Institutional Bank Functions
export const saveInstitutionalBank = async (bank) => {
  try {
    await initializeStorage();
    const banks = await fetchInstitutionalBanks();
    const newId = bank.id || `ib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const updatedBank = { 
      ...bank, 
      id: newId,
      transactions: bank.transactions || [],
      createdAt: bank.createdAt || new Date().toISOString()
    };
    
    let updatedBanks;
    const exists = banks.some((b) => b.id === updatedBank.id);
    if (exists) {
      updatedBanks = banks.map((b) => 
        b.id === updatedBank.id ? updatedBank : b
      );
    } else {
      updatedBanks = [...banks, updatedBank];
    }
    
    await AsyncStorage.setItem(INSTITUTIONAL_BANK_KEY, JSON.stringify(updatedBanks));
    console.log('Saved institutional bank:', updatedBank);
    return updatedBank;
  } catch (error) {
    console.error('Error saving institutional bank:', error);
    throw new Error('Failed to save institutional bank');
  }
};

export const fetchInstitutionalBanks = async () => {
  try {
    await initializeStorage();
    const banks = await AsyncStorage.getItem(INSTITUTIONAL_BANK_KEY);
    const parsed = banks ? JSON.parse(banks) : [];
    const validated = parsed.map((b, index) =>
      b.id ? b : { 
        ...b, 
        id: `ib_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        transactions: b.transactions || [],
        createdAt: b.createdAt || new Date().toISOString()
      }
    );
    
    if (parsed.length !== validated.length || parsed.some((b, index) => b.id !== validated[index].id)) {
      await AsyncStorage.setItem(INSTITUTIONAL_BANK_KEY, JSON.stringify(validated));
    }
    console.log('Fetched institutional banks:', validated);
    return validated;
  } catch (error) {
    console.error('Error fetching institutional banks:', error);
    throw new Error('Failed to fetch institutional banks');
  }
};

export const deleteInstitutionalBank = async (id) => {
  try {
    const banks = await fetchInstitutionalBanks();
    const updatedBanks = banks.filter((b) => b.id !== id);
    await AsyncStorage.setItem(INSTITUTIONAL_BANK_KEY, JSON.stringify(updatedBanks));
    console.log('Deleted institutional bank ID:', id);
  } catch (error) {
    console.error('Error deleting institutional bank:', error);
    throw new Error('Failed to delete institutional bank');
  }
};

export const addBankTransaction = async (transaction) => {
  try {
    const banks = await fetchInstitutionalBanks();
    const updatedBanks = banks.map((b) =>
      b.id === transaction.bankId
        ? { 
            ...b, 
            transactions: [...(b.transactions || []), { 
              ...transaction, 
              id: transaction.id || `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              date: transaction.date || new Date().toISOString().split('T')[0]
            }] 
          }
        : b
    );
    await AsyncStorage.setItem(INSTITUTIONAL_BANK_KEY, JSON.stringify(updatedBanks));
    console.log('Added transaction to bank:', transaction);
    return updatedBanks.find((b) => b.id === transaction.bankId);
  } catch (error) {
    console.error('Error adding bank transaction:', error);
    throw new Error('Failed to add bank transaction');
  }
};

export const updateBankBalance = async (bankId, newBalance) => {
  try {
    const banks = await fetchInstitutionalBanks();
    const updatedBanks = banks.map((b) =>
      b.id === bankId
        ? { ...b, balance: newBalance }
        : b
    );
    await AsyncStorage.setItem(INSTITUTIONAL_BANK_KEY, JSON.stringify(updatedBanks));
    console.log('Updated bank balance:', { bankId, newBalance });
    return updatedBanks.find((b) => b.id === bankId);
  } catch (error) {
    console.error('Error updating bank balance:', error);
    throw new Error('Failed to update bank balance');
  }
};