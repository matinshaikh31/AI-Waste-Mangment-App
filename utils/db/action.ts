import { db } from "./dbConfig";
import { Notifications, Users, Transactions } from "./schema";
import { sql, eq, and, desc } from "drizzle-orm";

//TO Create A User
export async function createUser(email: string, name: string) {
  try {
    const [user] = await db
      .insert(Users)
      .values({ email, name })
      .returning()
      .execute();
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

//TO Get User By Email ID
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

//TO Get Unread Notification
export async function getUnreadNotifications(userId: number) {
  try {
    return await db
      .select()
      .from(Notifications)
      .where(
        and(eq(Notifications.userId, userId), eq(Notifications.isRead, false))
      );
  } catch (error) {
    console.error("Unable TO Fetch Notification", error);
  }
}

//Get User Balance Base on a transication if transicatio type is earned than + if not -
export async function getUserBalance(userId: number): Promise<number> {
  const transactions = (await getRewardTransactions(userId)) || []; // Ensure it's an array
  const balance = transactions.reduce((acc: number, transaction: any) => {
    return transaction.type.startsWith("earned")
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);

  return Math.max(balance, 0); // Ensure balance is never negative
}

//Get History of transication
export async function getRewardTransactions(userId: number) {
  try {
    console.log("Fetching transactions for user ID:", userId);
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    console.log("Raw transactions from database:", transactions);

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      date: t.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    }));

    console.log("Formatted transactions:", formattedTransactions);
    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

//To make unread notification as Read
export async function markNotificationAsRead(notificationId:number) {
    try {
        await db.update(Notifications).set({isRead:true}).where(eq(Notifications.id,notificationId)).execute()
        
    } catch (error) {
        console.error("Error Marking Notification as read",error)
    }
}