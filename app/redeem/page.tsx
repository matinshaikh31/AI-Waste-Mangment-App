"use client";

import { Button } from "@/components/ui/button";
import {
  createTransaction,
  getAvailableRewards,
  getRewardTransactions,
  getUserBalance,
  getUserByEmail,
  redeemedPoints,
} from "@/utils/db/action";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Transaction = {
  id: number;
  type: "earned_report" | "earned_collect" | "redeemed";
  amount: number;
  description: string;
  date: string;
};
export default function RedeemPage() {
  const rewards = [
    { id: 1, rewardName: "10% Amazon Coupon", pointsRequired: 10 },
    { id: 2, rewardName: "30% Amazon Coupon", pointsRequired: 25 },
    { id: 3, rewardName: "Swags", pointsRequired: 25 },
    // Add more rewards as needed
  ];

  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const fetchUser = await getUserByEmail(userEmail);
          if (fetchUser) {
            setUser(fetchUser);
            const balance = await getUserBalance(fetchUser.id);
            setBalance(balance);
          }
        }
      } catch (error) {}
    };
    fetchUser();
  }, []);

  const handelRedeem = (points: number) => {
    if (user?.id) {
      try {
        if (balance>0) {
          createTransaction(
            user.id,
            "redeemed",
            points,
            "Redeem The Earned Points"
          );
          getUserBalance(user.id);
          toast.success("Success Fully Reedemed Reward Send To Your Mail");
        } else {
          toast.error("Not Enough Points To Reedem");
        }
      } catch (error) {
        console.error("Unbale To Redeem", error);
      }
    } else {
      toast.error("Login First");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Redeem Points
        </h1>

        <div className="bg-white shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Available Rewards
          </h2>
          <ul>
            {rewards.map((reward) => (
              <li
                key={reward.id}
                className="border-b border-gray-200 py-4 flex justify-between items-center"
              >
                <div className="text-lg text-gray-800">{reward.rewardName}</div>
                <div className="flex items-center space-x-4">
                  <span className="text-green-500 font-bold">
                    {reward.pointsRequired} Points
                  </span>
                  <Button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={() => handelRedeem(reward.pointsRequired)}
                  >
                    Redeem
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
