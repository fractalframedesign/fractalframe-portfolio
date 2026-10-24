'use client'

import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  Download,
  Ellipsis,
  FileText,
  Flag,
  Gift,
  Globe2,
  Landmark,
  MapPin,
  PiggyBank,
  ReceiptText,
  Send,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Upload,
  WalletCards,
} from 'lucide-react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Progress } from '@/components/project-demos/fintech-components/ui/progress'
import { Slider } from '@/components/project-demos/fintech-components/ui/slider'
import { Switch } from '@/components/project-demos/fintech-components/ui/switch'
import { cn } from '@/lib/utils'

const mastercardLogo = '/images/projects/fintech-components/cards/mastercard-logo.svg'
const sendMoneyAvatar1 = '/images/projects/fintech-components/figma-widgets/send-money-avatar-1.png'
const sendMoneyAvatar2 = '/images/projects/fintech-components/figma-widgets/send-money-avatar-2.png'
const sendMoneyAvatar3 = '/images/projects/fintech-components/figma-widgets/send-money-avatar-3.png'
const sendMoneyAvatarMain = '/images/projects/fintech-components/figma-widgets/send-money-avatar-main.png'
const sendMoneyAvatar5 = '/images/projects/fintech-components/figma-widgets/send-money-avatar-5.png'
const sendMoneyAvatar6 = '/images/projects/fintech-components/figma-widgets/send-money-avatar-6.png'
const sendMoneyAvatar7 = '/images/projects/fintech-components/figma-widgets/send-money-avatar-7.png'

type WidgetKind =
  | 'scan'
  | 'people'
  | 'savings'
  | 'confirmation'
  | 'converter'
  | 'payment'
  | 'checkout'
  | 'receipt'
  | 'summary'
  | 'details'
  | 'investment'
  | 'card'
  | 'invoice'
  | 'verify'
  | 'control'
  | 'limit'
  | 'subscription'
  | 'budget'
  | 'alert'
  | 'address'
  | 'updates'
  | 'review'
  | 'amount'
  | 'loan'
  | 'trade'
  | 'wallet'
  | 'score'
  | 'repayment'
  | 'envelope'
  | 'cashback'
  | 'creditRequest'
  | 'international'

interface FigmaWidget {
  title: string
  description?: string
  kind: WidgetKind
  accent?: 'primary' | 'success' | 'warning' | 'chart'
}

const figmaWidgets: FigmaWidget[] = [
  { title: 'Code Scan', description: 'Display one of the codes below to the cashier.', kind: 'scan' },
  { title: 'Send Money', description: 'Fast and secure way to transfer funds to anyone, anywhere', kind: 'people' },
  { title: 'Joint Savings', description: 'Save together for shared goals.', kind: 'savings', accent: 'success' },
  { title: 'Transfer Confirmation', description: 'Confirm the transfer before sending.', kind: 'confirmation' },
  { title: 'Currency Converter', description: 'Convert between balances instantly.', kind: 'converter', accent: 'chart' },
  { title: 'Send Money 2', description: 'Choose account, contact, and amount.', kind: 'people', accent: 'success' },
  { title: 'Payment', description: 'Review payment method and merchant.', kind: 'payment' },
  { title: 'Checkout', description: 'Complete the checkout with one tap.', kind: 'checkout', accent: 'warning' },
  { title: 'Receipt 1', description: 'Payment receipt and transaction ID.', kind: 'receipt' },
  { title: 'Summary', description: 'A compact payment summary.', kind: 'summary' },
  { title: 'Transaction Details', description: 'Detailed status and routing information.', kind: 'details' },
  { title: 'Smart Investment Pocket', description: 'Automatic investing for spare balances.', kind: 'investment', accent: 'chart' },
  { title: 'My Card', description: 'Card controls and balance.', kind: 'card' },
  { title: 'Invoice', description: 'Invoice due date and line items.', kind: 'invoice' },
  { title: 'Verify Account', description: 'Secure account verification.', kind: 'verify', accent: 'success' },
  { title: 'Control Panel', kind: 'control' },
  { title: 'Card Limit', description: 'Adjust your spending limits.', kind: 'limit' },
  { title: 'Subscription Plan', description: 'Manage the active monthly plan.', kind: 'subscription' },
  { title: 'Budget', description: 'Track current month spending.', kind: 'budget', accent: 'warning' },
  { title: 'Credit Card Design', description: 'Preview the selected card style.', kind: 'card', accent: 'chart' },
  { title: 'Transaction Alert', description: 'Unusual activity needs review.', kind: 'alert', accent: 'warning' },
  { title: 'Transfer Money', description: 'Transfer between saved recipients.', kind: 'payment' },
  { title: 'Delivery Address', description: 'Address for card delivery.', kind: 'address' },
  { title: 'Choose Subscription', description: 'Pick the plan that fits.', kind: 'subscription', accent: 'success' },
  { title: 'Transfer Updates', description: 'Live transfer timeline.', kind: 'updates' },
  { title: 'Payment Confirmation', description: 'Your payment was successful.', kind: 'confirmation', accent: 'success' },
  { title: 'Transaction Review', description: 'Review flags before approval.', kind: 'review' },
  { title: 'Enter Amount', description: 'Set a transfer amount.', kind: 'amount' },
  { title: 'Loan', description: 'Loan estimate and repayment terms.', kind: 'loan' },
  { title: 'Trade', description: 'Preview a market order.', kind: 'trade', accent: 'chart' },
  { title: 'Wallet Manager', description: 'Organize wallets and pockets.', kind: 'wallet' },
  { title: 'Credit Score Evaluation', description: 'Personalized score factors.', kind: 'score', accent: 'success' },
  { title: 'Receipt 2', description: 'Downloadable receipt detail.', kind: 'receipt', accent: 'chart' },
  { title: 'Credit Repayment Tracker', description: 'Progress toward next repayment.', kind: 'repayment' },
  { title: 'Money Envelope', description: 'Create an envelope for a goal.', kind: 'envelope', accent: 'success' },
  { title: 'Cashback', description: 'Monthly cashback progress.', kind: 'cashback', accent: 'success' },
  { title: 'Credit Cards', description: 'Manage linked credit cards.', kind: 'card' },
  { title: 'Credit Request', kind: 'creditRequest' },
  { title: 'International Transfer', description: 'Send money across currencies.', kind: 'international', accent: 'chart' },
  { title: 'Subscription Plan 2', description: 'Compare plan benefits.', kind: 'subscription', accent: 'chart' },
]

export const FIGMA_BANKING_WIDGET_COUNT = figmaWidgets.length

const sendMoneyAvatars = [
  { src: sendMoneyAvatar1, size: 70, bg: '#bce9d3' },
  { src: sendMoneyAvatar2, size: 80, bg: '#b2edff' },
  { src: sendMoneyAvatar3, size: 90, bg: '#f0e8ff' },
  { src: sendMoneyAvatarMain, size: 104, bg: '#fccbc9', main: true },
  { src: sendMoneyAvatar5, size: 90, bg: '#bce9d3' },
  { src: sendMoneyAvatar6, size: 80, bg: '#b2edff' },
  { src: sendMoneyAvatar7, size: 70, bg: '#f0e8ff' },
]

export function FigmaBankingWidgets({ className }: { className?: string }) {
  return (
    <section className={cn('flex flex-col gap-5', className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">Figma Widget Set</h2>
        <p className="text-sm text-muted-foreground">
          Components from the Banking Widgets Figma canvas, adapted to this app&apos;s theme tokens.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8 lg:justify-start">
        {figmaWidgets.map((widget) => (
          <FigmaWidgetCard key={widget.title} widget={widget} />
        ))}
      </div>
    </section>
  )
}

function FigmaWidgetCard({ widget }: { widget: FigmaWidget }) {
  return (
    <article className="flex min-h-[607px] max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <WidgetHeader widget={widget} />
      <div className="flex flex-1 flex-col justify-between gap-5">
        <WidgetBody widget={widget} />
        <WidgetFooter widget={widget} />
      </div>
    </article>
  )
}

function WidgetHeader({ widget }: { widget: FigmaWidget }) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-mono text-base font-normal uppercase tracking-[0.15em] text-muted-foreground">
            {widget.title}
          </h3>
          {widget.title === 'Control Panel' && (
            <span className="rounded-full bg-primary px-3 py-0.5 text-sm font-semibold text-primary-foreground">New</span>
          )}
        </div>
        <button
          type="button"
          aria-label={`${widget.title} options`}
          className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
        >
          <Ellipsis className="size-5" />
        </button>
      </div>
      {widget.description && <p className="text-base leading-6 text-muted-foreground">{widget.description}</p>}
    </header>
  )
}

function WidgetBody({ widget }: { widget: FigmaWidget }) {
  switch (widget.kind) {
    case 'scan':
      return <ScanWidget />
    case 'people':
      return <PeopleWidget />
    case 'savings':
      return <SavingsWidget />
    case 'confirmation':
      return <ConfirmationWidget accent={widget.accent} />
    case 'converter':
      return <ConverterWidget />
    case 'payment':
      return <PaymentWidget />
    case 'checkout':
      return <CheckoutWidget />
    case 'receipt':
      return <ReceiptWidget />
    case 'summary':
      return <SummaryWidget />
    case 'details':
      return <DetailsWidget />
    case 'investment':
      return <InvestmentWidget />
    case 'card':
      return <CardWidget accent={widget.accent} />
    case 'invoice':
      return <InvoiceWidget />
    case 'verify':
      return <VerifyWidget />
    case 'control':
      return <ControlPanelWidget />
    case 'limit':
      return <LimitWidget />
    case 'subscription':
      return <SubscriptionWidget accent={widget.accent} />
    case 'budget':
      return <BudgetWidget />
    case 'alert':
      return <AlertWidget />
    case 'address':
      return <AddressWidget />
    case 'updates':
      return <UpdatesWidget />
    case 'review':
      return <ReviewWidget />
    case 'amount':
      return <AmountWidget />
    case 'loan':
      return <LoanWidget />
    case 'trade':
      return <TradeWidget />
    case 'wallet':
      return <WalletWidget />
    case 'score':
      return <ScoreWidget />
    case 'repayment':
      return <RepaymentWidget />
    case 'envelope':
      return <EnvelopeWidget />
    case 'cashback':
      return <CashbackWidget />
    case 'creditRequest':
      return <CreditRequestWidget />
    case 'international':
      return <InternationalWidget />
  }
}

function WidgetFooter({ widget }: { widget: FigmaWidget }) {
  const labelByKind: Partial<Record<WidgetKind, string>> = {
    scan: 'Share my QR',
    people: 'Send Money',
    confirmation: 'Confirm',
    checkout: 'Pay Now',
    creditRequest: 'Submit',
    amount: 'Continue',
    verify: 'Verify Account',
    subscription: 'Choose Plan',
  }

  if (widget.kind === 'control' || widget.kind === 'receipt' || widget.kind === 'details') {
    return null
  }

  return (
    <Button className="h-16 w-full rounded-2xl text-lg font-bold" size="lg">
      {labelByKind[widget.kind] ?? 'Continue'}
    </Button>
  )
}

function ScanWidget() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7">
      <div className="grid w-full grid-cols-2 gap-1 text-center text-base font-medium">
        <span className="border-b-4 border-primary pb-3 text-foreground">QR Code</span>
        <span className="border-b-4 border-border pb-3 text-muted-foreground">Barcode</span>
      </div>
      <div className="relative grid size-[200px] grid-cols-7 grid-rows-7 gap-1 rounded-xl border border-border bg-background p-3">
        {Array.from({ length: 49 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'rounded-[2px]',
              (index + Math.floor(index / 7)) % 3 === 0 || index % 11 === 0 ? 'bg-foreground' : 'bg-transparent',
            )}
          />
        ))}
        <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-card text-sm font-semibold text-primary">
          KW
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">Scan to begin your journey</p>
        <p className="text-xs font-medium text-muted-foreground">
          Scan QR code with <span className="text-primary">app</span>
        </p>
      </div>
    </div>
  )
}

function PeopleWidget() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7">
      <div className="flex items-center justify-center">
        {sendMoneyAvatars.map((avatar, index) => (
          <div
            key={index}
            style={{
              width: avatar.size,
              height: avatar.size,
              backgroundColor: avatar.bg,
              marginLeft: index === 0 ? 0 : -avatar.size * 0.28,
              zIndex: avatar.main ? sendMoneyAvatars.length : undefined,
            }}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-full border-[3px] border-card shadow-sm',
              avatar.main && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-card',
            )}
          >
            <img src={avatar.src} alt="" className="size-full object-cover" />
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-2xl font-semibold tracking-wide text-foreground">Anastasia Yesenenko</p>
        <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-muted px-5 py-3 text-base font-medium">
          <img src={mastercardLogo} alt="" className="h-4 w-5 shrink-0" width={36} height={28} />
          <span>**** 1462</span>
          <ChevronDown className="size-4" />
        </div>
      </div>
      <ReviewBox rows={[['Commissions', '$12,8'], ['Amount', '$3,240']]} emphasizedLast />
    </div>
  )
}

function SavingsWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="rounded-2xl bg-muted p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Family vacation</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">$12,480</p>
          </div>
          <PiggyBank className="size-10 text-primary" />
        </div>
        <Progress value={72} className="mt-5" />
        <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
          <span>72% funded</span>
          <span>$18K goal</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['You', 'Mia', 'Noah'].map((name, index) => (
          <div key={name} className="rounded-xl border border-border p-3 text-center">
            <div className={cn('mx-auto mb-2 size-9 rounded-full', avatarColor(index))} />
            <p className="text-xs font-medium text-muted-foreground">{name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfirmationWidget({ accent }: { accent?: FigmaWidget['accent'] }) {
  const Icon = accent === 'success' ? Check : Send

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-11" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground">{accent === 'success' ? 'Payment Sent' : 'Ready to Transfer'}</p>
        <p className="mt-2 text-sm text-muted-foreground">Transfer to Sofia Bennett</p>
      </div>
      <ReviewBox rows={[['Amount', '$1,280.00'], ['Fee', '$4.25'], ['Arrival', 'Today, 2:45 PM']]} />
    </div>
  )
}

function ConverterWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <CurrencyRow label="You send" currency="USD" amount="$2,400" />
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <ArrowDown className="size-5" />
      </div>
      <CurrencyRow label="Recipient gets" currency="GBP" amount="£1,886" />
      <ReviewBox rows={[['Rate', '1 USD = 0.7858 GBP'], ['Fee', '$7.20']]} />
    </div>
  )
}

function CurrencyRow({ label, currency, amount }: { label: string; currency: string; amount: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-muted p-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{amount}</p>
      </div>
      <span className="rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm">{currency}</span>
    </div>
  )
}

function PaymentWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="rounded-2xl bg-muted p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-7" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Market order</p>
            <p className="text-sm text-muted-foreground">Today, 12:24</p>
          </div>
        </div>
      </div>
      <ReviewBox rows={[['Card', 'Visa 1121'], ['Amount', '$284.00'], ['Cashback', '$8.52']]} emphasizedLast />
    </div>
  )
}

function CheckoutWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="rounded-2xl border border-border p-5">
        {['Premium subscription', 'Extra storage', 'Tax'].map((item, index) => (
          <div key={item} className="flex items-center justify-between py-3 text-sm">
            <span className="text-muted-foreground">{item}</span>
            <span className="font-semibold text-foreground">{index === 0 ? '$24.00' : index === 1 ? '$8.00' : '$2.18'}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-primary/10 p-5">
        <span className="text-base font-semibold text-primary">Total</span>
        <span className="text-3xl font-semibold text-primary">$34.18</span>
      </div>
    </div>
  )
}

function ReceiptWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-5">
        <div className="mb-5 flex items-center justify-between">
          <ReceiptText className="size-8 text-primary" />
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Paid</span>
        </div>
        <ReviewBox rows={[['Receipt', '#RC-2048'], ['Merchant', 'Apple Store'], ['Total', '$240.24']]} emphasizedLast />
      </div>
      <Button variant="outline" className="h-12 rounded-full">
        <Download className="size-4" />
        Download PDF
      </Button>
    </div>
  )
}

function SummaryWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      {[
        ['Income', '$8,420', 'bg-success/10 text-success'],
        ['Spending', '$3,180', 'bg-warning/10 text-warning'],
        ['Saved', '$2,640', 'bg-primary/10 text-primary'],
      ].map(([label, value, className]) => (
        <div key={label} className="flex items-center justify-between rounded-2xl bg-muted p-5">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className={cn('rounded-full px-4 py-2 text-lg font-semibold', className)}>{value}</span>
        </div>
      ))}
    </div>
  )
}

function DetailsWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <ReviewBox rows={[['Status', 'Processing'], ['Reference', 'TRX-8842-90'], ['Network', 'ACH'], ['Date', 'Sep 20, 2026']]} />
      <div className="rounded-2xl bg-muted p-5">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <Copy className="size-4" />
          Copy transaction details
        </div>
      </div>
    </div>
  )
}

function InvestmentWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="flex items-end gap-2 rounded-2xl bg-muted p-5">
        {[38, 64, 48, 80, 56, 92, 72].map((height, index) => (
          <span
            key={height + index}
            className={cn('flex-1 rounded-t-lg', index > 4 ? 'bg-primary' : 'bg-primary/30')}
            style={{ height }}
          />
        ))}
      </div>
      <ReviewBox rows={[['Portfolio', '$18,250'], ['Return', '+12.8%'], ['Risk', 'Balanced']]} />
    </div>
  )
}

function CardWidget({ accent }: { accent?: FigmaWidget['accent'] }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div
        className={cn(
          'flex h-52 flex-col justify-between rounded-2xl p-5 text-primary-foreground shadow-lg',
          accent === 'chart' ? 'bg-chart-4' : 'bg-primary',
        )}
      >
        <div className="flex items-center justify-between">
          <CreditCard className="size-7" />
          <span className="font-mono text-sm uppercase tracking-[0.2em]">Visa</span>
        </div>
        <p className="font-mono text-xl tracking-wider tabular-nums">•••• •••• •••• 1121</p>
        <div className="flex justify-between text-sm">
          <span>John Carter</span>
          <span>02/30</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['Freeze', 'Limit', 'Details'].map((item) => (
          <button key={item} className="rounded-xl bg-muted px-3 py-3 text-xs font-semibold text-muted-foreground">
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

function InvoiceWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <div className="rounded-2xl bg-muted p-5">
        <FileText className="mb-4 size-8 text-primary" />
        <p className="text-xl font-semibold text-foreground">Invoice #8932</p>
        <p className="text-sm text-muted-foreground">Due in 5 days</p>
      </div>
      <ReviewBox rows={[['Design work', '$1,400'], ['Platform fee', '$42'], ['Total due', '$1,442']]} emphasizedLast />
    </div>
  )
}

function VerifyWidget() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-28 items-center justify-center rounded-full bg-success/10 text-success">
        <ShieldCheck className="size-14" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground">Secure verification</p>
        <p className="mt-2 text-sm text-muted-foreground">Confirm your identity with two quick checks.</p>
      </div>
      <div className="w-full space-y-3">
        {['Photo ID', 'Address match'].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-xl bg-muted p-4">
            <span className="font-medium text-foreground">{item}</span>
            <Check className="size-5 text-success" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ControlPanelWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-7">
      <ControlGroup title="Main" label="British Pound" value="$0" icon={<Flag className="size-6" />} />
      <ControlGroup title="Savings" label="Add Savings" value="4.75%" icon={<Gift className="size-6" />} />
      <ControlGroup title="Pockets" label="Add Pockets" value="Friends" icon={<WalletCards className="size-6" />} />
    </div>
  )
}

function ControlGroup({ title, label, value, icon }: { title: string; label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <ChevronUp className="size-5" />
      </div>
      <div className="rounded-2xl bg-muted p-1.5">
        <div className="flex items-center gap-4 rounded-xl border border-dashed border-muted-foreground/35 p-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-card text-primary">{icon}</span>
          <span className="flex-1 text-lg font-medium text-foreground">{label}</span>
          <span className="font-medium text-foreground">{value}</span>
        </div>
      </div>
    </div>
  )
}

function LimitWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Monthly card limit</p>
            <p className="text-3xl font-semibold text-foreground">$8,500</p>
          </div>
          <SlidersHorizontal className="size-7 text-primary" />
        </div>
        <Slider value={68} max={100} step={1} aria-label="Monthly card limit" />
      </div>
      <ReviewBox rows={[['Spent', '$5,780'], ['Remaining', '$2,720']]} />
      <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
        <span className="font-medium text-foreground">Online purchases</span>
        <Switch defaultChecked aria-label="Online purchases" />
      </div>
    </div>
  )
}

function SubscriptionWidget({ accent }: { accent?: FigmaWidget['accent'] }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <div className="rounded-2xl border border-primary bg-primary/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold text-foreground">{accent === 'chart' ? 'Business' : 'Premium'}</p>
            <p className="text-sm text-muted-foreground">Best for everyday banking</p>
          </div>
          <p className="text-3xl font-semibold text-primary">$12</p>
        </div>
      </div>
      {['No transfer fee', 'Priority support', 'Higher card limits'].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-xl bg-muted p-4">
          <Check className="size-5 text-success" />
          <span className="font-medium text-foreground">{item}</span>
        </div>
      ))}
    </div>
  )
}

function BudgetWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">Current budget</p>
        <p className="text-4xl font-semibold text-foreground">$2,840</p>
      </div>
      <Progress value={62} />
      <div className="grid grid-cols-2 gap-3">
        <BudgetTile label="Groceries" value="$820" />
        <BudgetTile label="Transport" value="$310" />
        <BudgetTile label="Shopping" value="$640" />
        <BudgetTile label="Bills" value="$1,070" />
      </div>
    </div>
  )
}

function BudgetTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function AlertWidget() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-warning/15 text-warning">
        <Bell className="size-11" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground">Review transaction</p>
        <p className="mt-2 text-sm text-muted-foreground">A new merchant charge is larger than usual.</p>
      </div>
      <ReviewBox rows={[['Merchant', 'Travel Pro'], ['Amount', '$1,240'], ['Location', 'London']]} />
    </div>
  )
}

function AddressWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <div className="rounded-2xl bg-muted p-5">
        <MapPin className="mb-5 size-8 text-primary" />
        <p className="text-lg font-semibold text-foreground">221B Baker Street</p>
        <p className="text-sm text-muted-foreground">London NW1 6XE, United Kingdom</p>
      </div>
      {['Home delivery', 'Signature required'].map((item) => (
        <div key={item} className="flex items-center justify-between rounded-xl border border-border p-4">
          <span className="font-medium text-foreground">{item}</span>
          <Check className="size-5 text-success" />
        </div>
      ))}
    </div>
  )
}

function UpdatesWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      {['Transfer created', 'Bank processing', 'Recipient notified'].map((item, index) => (
        <div key={item} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className={cn('size-4 rounded-full', index < 2 ? 'bg-primary' : 'bg-muted-foreground/30')} />
            {index < 2 && <span className="h-14 w-px bg-border" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">{item}</p>
            <p className="text-sm text-muted-foreground">{index === 0 ? '12:24' : index === 1 ? '12:32' : 'Estimated 13:10'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <ReviewBox rows={[['Risk score', 'Low'], ['Duplicate check', 'Clear'], ['Compliance', 'Pending']]} />
      <div className="rounded-2xl bg-muted p-5">
        <p className="text-sm font-medium text-muted-foreground">Reviewer note</p>
        <p className="mt-2 text-base text-foreground">Recipient is verified. Amount is within normal transfer range.</p>
      </div>
    </div>
  )
}

function AmountWidget() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">Enter amount</p>
        <p className="text-5xl font-semibold tracking-tight text-foreground">$1,280</p>
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {['+ $50', '+ $100', '+ $500'].map((item) => (
          <button key={item} className="rounded-xl bg-muted py-4 text-sm font-semibold text-foreground">
            {item}
          </button>
        ))}
      </div>
      <ReviewBox rows={[['From', 'Checking'], ['To', 'Sofia Bennett']]} />
    </div>
  )
}

function LoanWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="rounded-2xl bg-muted p-5">
        <Landmark className="mb-5 size-8 text-primary" />
        <p className="text-3xl font-semibold text-foreground">$30,000</p>
        <p className="text-sm text-muted-foreground">Estimated eligible loan</p>
      </div>
      <ReviewBox rows={[['APR', '7.8%'], ['Monthly', '$624'], ['Term', '60 months']]} />
    </div>
  )
}

function TradeWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="flex items-center justify-between rounded-2xl bg-muted p-5">
        <div>
          <p className="text-xl font-semibold text-foreground">ETH</p>
          <p className="text-sm text-muted-foreground">Ethereum</p>
        </div>
        <p className="text-2xl font-semibold text-success">+4.8%</p>
      </div>
      <div className="flex items-end gap-2 rounded-2xl border border-border p-5">
        {[34, 58, 44, 72, 64, 92, 86, 110].map((height, index) => (
          <span key={height + index} className="flex-1 rounded-t bg-primary" style={{ height }} />
        ))}
      </div>
    </div>
  )
}

function WalletWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      {[
        ['Main Wallet', '$12,840', WalletCards],
        ['Savings Pocket', '$5,420', PiggyBank],
        ['Travel Fund', '$1,220', Globe2],
      ].map(([label, value, Icon]) => (
        <div key={label as string} className="flex items-center gap-4 rounded-2xl bg-muted p-5">
          <span className="flex size-12 items-center justify-center rounded-full bg-card text-primary">
            <Icon className="size-6" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{label as string}</p>
            <p className="text-sm text-muted-foreground">{value as string}</p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground" />
        </div>
      ))}
    </div>
  )
}

function ScoreWidget() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="relative flex size-44 items-center justify-center rounded-full border-[16px] border-success/20">
        <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-success border-r-success" />
        <div className="text-center">
          <p className="text-4xl font-semibold text-foreground">742</p>
          <p className="text-sm text-muted-foreground">Excellent</p>
        </div>
      </div>
      <ReviewBox rows={[['Payment history', '98%'], ['Utilization', '21%']]} />
    </div>
  )
}

function RepaymentWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="rounded-2xl bg-muted p-5">
        <CalendarDays className="mb-4 size-8 text-primary" />
        <p className="text-xl font-semibold text-foreground">Next repayment</p>
        <p className="text-sm text-muted-foreground">October 12, 2026</p>
      </div>
      <Progress value={68} />
      <ReviewBox rows={[['Paid', '$12,240'], ['Remaining', '$5,760']]} />
    </div>
  )
}

function EnvelopeWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="rounded-2xl bg-success/10 p-5">
        <PiggyBank className="mb-4 size-9 text-success" />
        <p className="text-2xl font-semibold text-foreground">Emergency envelope</p>
        <p className="text-sm text-muted-foreground">Protected balance</p>
      </div>
      <ReviewBox rows={[['Saved', '$3,800'], ['Target', '$5,000'], ['Auto-save', '$150/mo']]} />
    </div>
  )
}

function CashbackWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="flex h-14 items-center justify-between gap-1" role="img" aria-label="Cashback progress">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} className={cn('h-full w-1.5 rounded-full', index < 15 ? 'bg-primary' : 'bg-primary/15')} />
        ))}
      </div>
      <div>
        <p className="text-3xl font-semibold text-foreground">$240.24</p>
        <p className="text-sm text-muted-foreground">Total cashback this month</p>
      </div>
      <ReviewBox rows={[['Internship & Contract', '34%'], ['Freelance Projects', '16%'], ['Referral Bonuses', '12%']]} />
    </div>
  )
}

function CreditRequestWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <div className="grid grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-border bg-[repeating-linear-gradient(45deg,transparent,transparent_16px,var(--muted)_16px,var(--muted)_34px)] p-5 text-center">
          <Upload className="size-7 text-primary" />
          <p className="mt-3 text-sm font-medium text-foreground">Upload documents</p>
          <p className="mt-2 text-xs text-muted-foreground">1600*1200 (max 10 MB)</p>
        </div>
        <div className="space-y-4">
          <Field label="Credit Type" value="Personal loan" />
          <Field label="Credit Amount" value="$1,000.00" />
          <Slider value={31} max={100} aria-label="Credit amount" />
        </div>
      </div>
      <Field label="More information" value="Provide a short explanation..." muted />
      <div className="flex flex-wrap gap-2">
        {['Loan', 'Personal Finance', 'Mortgage'].map((tag) => (
          <span key={tag} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function InternationalWidget() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="flex items-center justify-between rounded-2xl bg-muted p-5">
        <div className="flex items-center gap-3">
          <Globe2 className="size-8 text-primary" />
          <div>
            <p className="font-semibold text-foreground">United States</p>
            <p className="text-sm text-muted-foreground">USD account</p>
          </div>
        </div>
        <ArrowLeftRight className="size-5 text-muted-foreground" />
      </div>
      <CurrencyRow label="Arrives in" currency="UK" amount="2 days" />
      <ReviewBox rows={[['Transfer', '$2,400'], ['Converted', '£1,886'], ['Fee', '$7.20']]} />
    </div>
  )
}

function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className={cn('mt-2 flex rounded-lg bg-muted px-4 py-3 text-sm font-medium', muted ? 'text-muted-foreground' : 'text-foreground')}>
        {value}
      </span>
    </label>
  )
}

function ReviewBox({ rows, emphasizedLast }: { rows: [string, string][]; emphasizedLast?: boolean }) {
  return (
    <div className="w-full rounded-2xl bg-muted p-4">
      {rows.map(([label, value], index) => (
        <div key={label} className="flex items-center justify-between gap-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span
            className={cn(
              'text-right font-medium text-foreground',
              emphasizedLast && index === rows.length - 1 ? 'text-2xl font-semibold' : 'text-base',
            )}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

function avatarColor(index: number, accent?: FigmaWidget['accent']) {
  const classes = [
    'bg-success/20 text-success',
    'bg-primary/15 text-primary',
    'bg-warning/20 text-warning',
    'bg-destructive/15 text-destructive',
    'bg-chart-4/20 text-chart-4',
    'bg-chart-5/20 text-chart-5',
    'bg-muted text-muted-foreground',
  ]

  if (accent === 'success') return classes[(index + 2) % classes.length]
  return classes[index % classes.length]
}

export default FigmaBankingWidgets
