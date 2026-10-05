import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Account,
  Category,
  Goal,
  RecurringBill,
  Transaction,
} from '../types/finance';
import { User } from '../types/auth';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_GOALS,
  INITIAL_RECURRING,
  INITIAL_TRANSACTIONS,
} from '../utils/initialData';

// User Authentication Documents
export async function findUserByEmailInDb(email: string): Promise<User | null> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email.trim().toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docData = snap.docs[0].data();
    return docData as User;
  } catch (err) {
    console.warn('Failed to query user by email in Firestore:', err);
    return null;
  }
}

export async function saveUserToDb(user: User): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (err) {
    console.warn('Failed to save user in Firestore:', err);
  }
}

export async function updateUserInDb(userId: string, data: Partial<User>): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), data);
  } catch (err) {
    console.warn('Failed to update user in Firestore:', err);
  }
}

// Auto-seed user data if Firestore collections are empty
export async function seedUserDataIfEmpty(userId: string): Promise<{
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: Goal[];
  recurring: RecurringBill[];
}> {
  try {
    const catsRef = collection(db, 'users', userId, 'categories');
    const existingCats = await getDocs(catsRef);

    // If categories already exist, user has initialized data
    if (!existingCats.empty) {
      return await loadAllUserDataFromDb(userId);
    }

    console.log(`[Database Seed] Semeadura inicial automática para o usuário ${userId}...`);
    const batch = writeBatch(db);

    // 1. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      batch.set(doc(db, 'users', userId, 'categories', cat.id), cat);
    }

    // 2. Seed Accounts
    for (const acc of INITIAL_ACCOUNTS) {
      batch.set(doc(db, 'users', userId, 'accounts', acc.id), acc);
    }

    // 3. Seed Transactions
    for (const tx of INITIAL_TRANSACTIONS) {
      batch.set(doc(db, 'users', userId, 'transactions', tx.id), tx);
    }

    // 4. Seed Goals
    for (const goal of INITIAL_GOALS) {
      batch.set(doc(db, 'users', userId, 'goals', goal.id), goal);
    }

    // 5. Seed Recurring Bills
    for (const bill of INITIAL_RECURRING) {
      batch.set(doc(db, 'users', userId, 'recurring', bill.id), bill);
    }

    await batch.commit();
    console.log('[Database Seed] Banco de dados semeado com sucesso!');

    return {
      transactions: INITIAL_TRANSACTIONS,
      categories: INITIAL_CATEGORIES,
      accounts: INITIAL_ACCOUNTS,
      goals: INITIAL_GOALS,
      recurring: INITIAL_RECURRING,
    };
  } catch (err) {
    console.error('Error during database seed:', err);
    return {
      transactions: INITIAL_TRANSACTIONS,
      categories: INITIAL_CATEGORIES,
      accounts: INITIAL_ACCOUNTS,
      goals: INITIAL_GOALS,
      recurring: INITIAL_RECURRING,
    };
  }
}

// Load all collections for active user
export async function loadAllUserDataFromDb(userId: string): Promise<{
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: Goal[];
  recurring: RecurringBill[];
}> {
  try {
    const [txSnap, catSnap, accSnap, goalSnap, recSnap] = await Promise.all([
      getDocs(collection(db, 'users', userId, 'transactions')),
      getDocs(collection(db, 'users', userId, 'categories')),
      getDocs(collection(db, 'users', userId, 'accounts')),
      getDocs(collection(db, 'users', userId, 'goals')),
      getDocs(collection(db, 'users', userId, 'recurring')),
    ]);

    const transactions = txSnap.docs.map((d) => d.data() as Transaction);
    const categories = catSnap.docs.map((d) => d.data() as Category);
    const accounts = accSnap.docs.map((d) => d.data() as Account);
    const goals = goalSnap.docs.map((d) => d.data() as Goal);
    const recurring = recSnap.docs.map((d) => d.data() as RecurringBill);

    return {
      transactions: transactions.length > 0 ? transactions : INITIAL_TRANSACTIONS,
      categories: categories.length > 0 ? categories : INITIAL_CATEGORIES,
      accounts: accounts.length > 0 ? accounts : INITIAL_ACCOUNTS,
      goals: goals.length > 0 ? goals : INITIAL_GOALS,
      recurring: recurring.length > 0 ? recurring : INITIAL_RECURRING,
    };
  } catch (err) {
    console.error('Failed to load user data from Firestore:', err);
    return {
      transactions: INITIAL_TRANSACTIONS,
      categories: INITIAL_CATEGORIES,
      accounts: INITIAL_ACCOUNTS,
      goals: INITIAL_GOALS,
      recurring: INITIAL_RECURRING,
    };
  }
}

// Transaction mutations
export async function dbAddTransaction(userId: string, tx: Transaction): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId, 'transactions', tx.id), tx);
  } catch (e) {
    console.warn('dbAddTransaction error:', e);
  }
}

export async function dbUpdateTransaction(
  userId: string,
  txId: string,
  data: Partial<Transaction>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId, 'transactions', txId), data);
  } catch (e) {
    console.warn('dbUpdateTransaction error:', e);
  }
}

export async function dbDeleteTransaction(userId: string, txId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'transactions', txId));
  } catch (e) {
    console.warn('dbDeleteTransaction error:', e);
  }
}

// Account mutations
export async function dbAddAccount(userId: string, acc: Account): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId, 'accounts', acc.id), acc);
  } catch (e) {
    console.warn('dbAddAccount error:', e);
  }
}

export async function dbUpdateAccount(
  userId: string,
  accId: string,
  data: Partial<Account>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId, 'accounts', accId), data);
  } catch (e) {
    console.warn('dbUpdateAccount error:', e);
  }
}

export async function dbDeleteAccount(userId: string, accId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'accounts', accId));
  } catch (e) {
    console.warn('dbDeleteAccount error:', e);
  }
}

// Category mutations
export async function dbUpdateCategory(
  userId: string,
  catId: string,
  data: Partial<Category>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId, 'categories', catId), data);
  } catch (e) {
    console.warn('dbUpdateCategory error:', e);
  }
}

// Goal mutations
export async function dbAddGoal(userId: string, goal: Goal): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId, 'goals', goal.id), goal);
  } catch (e) {
    console.warn('dbAddGoal error:', e);
  }
}

export async function dbUpdateGoal(
  userId: string,
  goalId: string,
  data: Partial<Goal>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId, 'goals', goalId), data);
  } catch (e) {
    console.warn('dbUpdateGoal error:', e);
  }
}

export async function dbDeleteGoal(userId: string, goalId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
  } catch (e) {
    console.warn('dbDeleteGoal error:', e);
  }
}

// Recurring mutations
export async function dbAddRecurring(userId: string, bill: RecurringBill): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId, 'recurring', bill.id), bill);
  } catch (e) {
    console.warn('dbAddRecurring error:', e);
  }
}

export async function dbUpdateRecurring(
  userId: string,
  billId: string,
  data: Partial<RecurringBill>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId, 'recurring', billId), data);
  } catch (e) {
    console.warn('dbUpdateRecurring error:', e);
  }
}

export async function dbDeleteRecurring(userId: string, billId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'recurring', billId));
  } catch (e) {
    console.warn('dbDeleteRecurring error:', e);
  }
}
