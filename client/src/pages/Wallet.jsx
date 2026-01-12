import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, ArrowDownRight, ArrowUpRight, Users } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Wallet = () => {
  const queryClient = useQueryClient();
  const { canManageProjects, user } = useAuth();
  const [payoutData, setPayoutData] = useState({ user_id: '', amount: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState('');

  const walletUserId = canManageProjects && selectedUserId ? selectedUserId : undefined;

  const { data: overview, isLoading: overviewLoading, isFetching: overviewFetching } = useQuery({
    queryKey: ['wallet-overview', walletUserId],
    queryFn: () => {
      const params = walletUserId ? `?user_id=${walletUserId}` : '';
      return axiosClient.get(`/wallet/overview/${params}`).then(res => res.data);
    },
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions', walletUserId],
    queryFn: () => {
      const params = walletUserId ? `?user_id=${walletUserId}` : '';
      return axiosClient.get(`/wallet/transactions/${params}`).then(res => res.data);
    },
  });

  const { data: users } = useQuery({
    queryKey: ['wallet-users'],
    queryFn: () => axiosClient.get('/users/').then(res => res.data.results),
    enabled: canManageProjects,
  });

  const payoutMutation = useMutation({
    mutationFn: (payload) => axiosClient.post('/wallet/payout/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['wallet-overview']);
      queryClient.invalidateQueries(['wallet-transactions']);
      setPayoutData({ user_id: '', amount: '', description: '' });
      alert('Payout processed successfully.');
    },
    onError: (error) => {
      alert(error?.response?.data?.detail || 'Failed to process payout.');
    },
  });

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    payoutMutation.mutate({ ...payoutData, amount: payoutData.amount || 0 });
  };

  const balance = overview?.balance || 0;
  const currency = overview?.currency || 'USD';
  const walletOwner = overview?.user || {
    id: user?.id,
    first_name: user?.first_name,
    last_name: user?.last_name,
    username: user?.username,
  };
  const txList = Array.isArray(transactions) ? transactions : overview?.transactions || [];

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-2">Finance</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Wallet</h1>
          <p className="text-neutral-500 mt-1">Track earnings, balances, and payouts.</p>
        </div>
        {canManageProjects && (
          <div className="flex items-center gap-3 sm:mt-0">
            <label className="text-sm text-neutral-600">Viewing</label>
            <select
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">My Wallet</option>
              {users?.filter((u) => u.role === 'member').map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name && member.last_name
                    ? `${member.first_name} ${member.last_name}`
                    : member.username}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Current Balance</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">
                {currency} {Number(balance).toFixed(2)}
              </p>
              {walletOwner && (
                <p className="text-sm text-neutral-500 mt-1">
                  {walletOwner.first_name || walletOwner.last_name
                    ? `${walletOwner.first_name || ''} ${walletOwner.last_name || ''}`.trim()
                    : walletOwner.username}
                </p>
              )}
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Transactions</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{txList.length}</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Currency</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{currency}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <ArrowDownRight className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Recent Transactions</h2>
              <p className="text-sm text-neutral-500">Latest credits and debits</p>
            </div>
          </div>
          {transactionsLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-16 bg-neutral-100 rounded"></div>
              ))}
            </div>
          ) : txList.length === 0 ? (
            <p className="text-neutral-500 text-center py-6">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {txList.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-neutral-900 capitalize">{tx.transaction_type}</p>
                    <p className="text-sm text-neutral-500">
                      {tx.description || 'No description'}
                      {tx.task_title ? ` • ${tx.task_title}` : ''}
                    </p>
                  </div>
                  <div className={`text-right font-semibold ${tx.transaction_type === 'credit' ? 'text-success-600' : 'text-danger-600'}`}>
                    {tx.transaction_type === 'credit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    <p className="text-xs text-neutral-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {canManageProjects && (
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Process Payout</h2>
                <p className="text-sm text-neutral-500">Send payments to team members</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>

            <form className="space-y-4" onSubmit={handlePayoutSubmit}>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Team Member</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={payoutData.user_id}
                  onChange={(e) => setPayoutData((prev) => ({ ...prev, user_id: e.target.value }))}
                  required
                >
                  <option value="">Select member</option>
                  {users?.filter((u) => u.role === 'member').map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name && member.last_name
                        ? `${member.first_name} ${member.last_name}`
                        : member.username}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Amount"
                type="number"
                step="0.01"
                required
                value={payoutData.amount}
                onChange={(e) => setPayoutData((prev) => ({ ...prev, amount: e.target.value }))}
              />

              <Input
                label="Description"
                placeholder="Optional description"
                value={payoutData.description}
                onChange={(e) => setPayoutData((prev) => ({ ...prev, description: e.target.value }))}
              />

              <Button type="submit" loading={payoutMutation.isPending} disabled={payoutMutation.isPending} className="w-full">
                Send Payout
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Wallet;
