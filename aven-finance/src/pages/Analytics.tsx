import { useMemo, useState } from 'react'
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiActivity,
  FiCalendar,
  FiBarChart2,
} from 'react-icons/fi'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { useFinance } from '../context/FinanceContext'
import { money } from '../lib/format'

const chartColors = [
  '#176B4D',
  '#72A68C',
  '#D6A85F',
  '#7299C8',
  '#B58BC8',
  '#E28B76',
  '#94A3B8',
]

type Period = '7' | '30' | '90' | '365'

export default function Analytics() {
  const { transactions, currency } = useFinance()
  const [period, setPeriod] = useState<Period>('30')

  const filteredTransactions = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - Number(period))

    return transactions.filter((transaction) => {
      const date = new Date(transaction.date)
      return !Number.isNaN(date.getTime()) && date >= cutoff
    })
  }, [transactions, period])

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (result, transaction) => {
        if (transaction.type === 'income') {
          result.income += transaction.amount
        } else {
          result.expenses += transaction.amount
        }

        return result
      },
      { income: 0, expenses: 0 },
    )
  }, [filteredTransactions])

  const monthlyData = useMemo(() => {
    const grouped = new Map<
      string,
      { label: string; income: number; expenses: number; sortKey: string }
    >()

    for (const transaction of filteredTransactions) {
      const date = new Date(transaction.date)
      const sortKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`

      const label = date.toLocaleDateString('en', {
        month: 'short',
        year: '2-digit',
      })

      if (!grouped.has(sortKey)) {
        grouped.set(sortKey, {
          label,
          income: 0,
          expenses: 0,
          sortKey,
        })
      }

      const item = grouped.get(sortKey)!

      if (transaction.type === 'income') {
        item.income += transaction.amount
      } else {
        item.expenses += transaction.amount
      }
    }

    return [...grouped.values()]
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ label, income, expenses }) => ({
        label,
        income,
        expenses,
      }))
  }, [filteredTransactions])

  const categoryData = useMemo(() => {
    const grouped = new Map<string, number>()

    for (const transaction of filteredTransactions) {
      if (transaction.type !== 'expense') continue

      const category = transaction.category || 'Other'
      grouped.set(
        category,
        (grouped.get(category) ?? 0) + transaction.amount,
      )
    }

    return [...grouped.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTransactions])

  const savings = totals.income - totals.expenses
  const savingsRate =
    totals.income > 0 ? (savings / totals.income) * 100 : 0

  const cards = [
    {
      title: 'Total income',
      value: money(totals.income, currency),
      note: 'Money received',
      icon: FiTrendingUp,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Total expenses',
      value: money(totals.expenses, currency),
      note: 'Money spent',
      icon: FiTrendingDown,
      iconClass: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Net savings',
      value: money(savings, currency),
      note: 'Income minus expenses',
      icon: FiDollarSign,
      iconClass: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Savings rate',
      value: `${savingsRate.toFixed(1)}%`,
      note: 'Of total income',
      icon: FiActivity,
      iconClass: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <main className="min-h-screen bg-[#F7F9F7] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-emerald-700">
              Financial overview
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Analytics
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Understand where your money comes from and where it goes.
            </p>
          </div>

          <label className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm sm:self-auto">
            <FiCalendar size={17} />
            <span className="sr-only">Date range</span>
            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as Period)
              }
              className="bg-transparent font-medium outline-none"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 12 months</option>
            </select>
          </label>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon

            return (
              <article
                key={card.title}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <Icon size={19} />
                  </span>
                </div>

                <p className="mt-5 break-words text-2xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{card.note}</p>
              </article>
            )
          })}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
            <div className="mb-6">
              <h2 className="font-semibold text-slate-900">
                Income vs. expenses
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Monthly totals for the selected period
              </p>
            </div>

            <div className="h-72 w-full">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient
                        id="incomeFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#176B4D"
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="95%"
                          stopColor="#176B4D"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="expenseFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#E28B76"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#E28B76"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#EEF2EF"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={65}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      tickFormatter={(value: number) =>
                        value.toLocaleString()
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        money(Number(value ?? 0), currency)
                      }
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E2E8F0',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#176B4D"
                      strokeWidth={2.5}
                      fill="url(#incomeFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#E28B76"
                      strokeWidth={2.5}
                      fill="url(#expenseFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No transactions in this period yet." />
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold text-slate-900">
              Spending by category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              How your expenses are distributed
            </p>

            <div className="relative mt-4 h-56">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {categoryData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        money(Number(value ?? 0), currency)
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="Add expenses to see your categories." />
              )}
            </div>

            <div className="mt-3 space-y-3">
              {categoryData.slice(0, 5).map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    />
                    <span className="truncate text-slate-600">
                      {item.name}
                    </span>
                  </div>
                  <span className="shrink-0 font-medium text-slate-900">
                    {money(item.value, currency)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">
              Cash flow comparison
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Compare money received with money spent
            </p>
          </div>

          <div className="h-72 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={8}>
                  <CartesianGrid
                    stroke="#EEF2EF"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={65}
                  />
                  <Tooltip
                    formatter={(value) =>
                      money(Number(value ?? 0), currency)
                    }
                  />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#176B4D"
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#E8A092"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Your cash flow chart will appear when transactions are available." />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
        <FiBarChart2 size={20} />
      </span>
      <p className="max-w-xs text-sm text-slate-500">{message}</p>
    </div>
  )
}