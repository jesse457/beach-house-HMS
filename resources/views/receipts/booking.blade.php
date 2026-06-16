<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - {{ $booking->booking_reference }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            .no-print { display: none !important; }
            body { background-color: white !important; padding: 0 !important; }
            .print-shadow-none { shadow: none !important; }
            .print-border { border: 1px solid #e5e7eb !important; }
        }
        @page {
            size: A4;
            margin: 1cm;
        }
    </style>
</head>
<body class="bg-gray-100 py-10 px-4">

    <!-- Action Buttons -->
    <div class="max-w-3xl mx-auto mb-6 flex justify-between items-center no-print">
        <a href="javascript:history.back()" class="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2">
            ← Back to Dashboard
        </a>
        <button onclick="window.print()" class="bg-[#2D5016] text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-[#3d6b1e] transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
        </button>
    </div>

    <!-- Main Receipt Container -->
    <div class="max-w-3xl mx-auto bg-white shadow-xl rounded-none print-shadow-none p-10 border border-gray-100">

        <!-- Header -->
        <div class="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
            <div>
                <h1 class="text-3xl font-black text-[#2D5016] tracking-tighter italic mb-1">LUXURY HOTEL</h1>
                <p class="text-xs text-gray-500 uppercase tracking-widest font-bold">Official Payment Receipt</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-bold text-gray-900">Reference: {{ $booking->booking_reference }}</p>
                <p class="text-xs text-gray-500">Date: {{ now()->format('M d, Y H:i') }}</p>
                <p class="text-xs text-gray-500">Status: {{ strtoupper($booking->status->value) }}</p>
            </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-12 mb-10">
            <div>
                <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Guest Details</h3>
                <p class="text-sm font-bold text-gray-800">{{ $booking->guest->name }}</p>
                <p class="text-xs text-gray-600">{{ $booking->guest->email }}</p>
                <p class="text-xs text-gray-600">{{ $booking->guest->phone }}</p>
                <p class="text-xs text-gray-600 italic mt-1">{{ $booking->guest->address }}</p>
            </div>
            <div class="text-right">
                <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Stay Summary</h3>
                <p class="text-xs text-gray-600"><span class="font-bold text-gray-800">Check-In:</span> {{ $booking->checked_in_at->format('M d, Y') }}</p>
                <p class="text-xs text-gray-600"><span class="font-bold text-gray-800">Check-Out:</span> {{ $booking->checked_out_at->format('M d, Y') }}</p>
                <p class="text-xs text-gray-600"><span class="font-bold text-gray-800">Duration:</span> {{ $booking->nights }} Night(s)</p>
                <p class="text-xs text-gray-600"><span class="font-bold text-gray-800">Guests:</span> {{ $booking->adults_count }} Adults, {{ $booking->children_count }} Children</p>
            </div>
        </div>

        <!-- Billing Table -->
        <table class="w-full mb-10">
            <thead>
                <tr class="border-b border-gray-200">
                    <th class="text-left text-[10px] font-black text-gray-400 uppercase py-3">Description</th>
                    <th class="text-center text-[10px] font-black text-gray-400 uppercase py-3">Qty/Nights</th>
                    <th class="text-right text-[10px] font-black text-gray-400 uppercase py-3">Rate</th>
                    <th class="text-right text-[10px] font-black text-gray-400 uppercase py-3">Amount</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">

                <!-- Rooms -->
                @foreach($booking->rooms as $room)
                <tr>
                    <td class="py-4">
                        <p class="text-sm font-bold text-gray-800">Room {{ $room->room_number }}</p>
                        <p class="text-[10px] text-gray-400 font-medium">{{ $room->roomType->name ?? 'Standard Accommodation' }}</p>
                    </td>
                    <td class="text-center text-sm text-gray-600">{{ $booking->nights }}</td>
                    <td class="text-right text-sm text-gray-600">{{ number_format($room->pivot->price_at_booking / $booking->nights, 2) }}</td>
                    <td class="text-right text-sm font-bold text-gray-800">XAF {{ number_format($room->pivot->price_at_booking, 2) }}</td>
                </tr>
                @endforeach

                <!-- Amenities -->
                @foreach($booking->amenityBookings as $amenity)
                <tr>
                    <td class="py-4">
                        <p class="text-sm font-bold text-gray-800">{{ $amenity->amenity->name }}</p>
                        <p class="text-[10px] text-gray-400 font-medium">Facility / Service Pass</p>
                    </td>
                    <td class="text-center text-sm text-gray-600">{{ $amenity->quantity }}</td>
                    <td class="text-right text-sm text-gray-600">{{ number_format($amenity->price_at_booking, 2) }}</td>
                    <td class="text-right text-sm font-bold text-gray-800">XAF {{ number_format($amenity->price_at_booking * $amenity->quantity, 2) }}</td>
                </tr>
                @endforeach

                <!-- Guest Orders -->
                @foreach($booking->guestOrders as $order)
                <tr>
                    <td class="py-4">
                        <p class="text-sm font-bold text-gray-800">Guest Order #{{ $order->id }}</p>
                        <p class="text-[10px] text-gray-400 font-medium">Food, Drinks & Services</p>
                    </td>
                    <td class="text-center text-sm text-gray-600">1</td>
                    <td class="text-right text-sm text-gray-600">{{ number_format($order->total_amount, 2) }}</td>
                    <td class="text-right text-sm font-bold text-gray-800">XAF {{ number_format($order->total_amount, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals Calculation -->
        <div class="flex justify-end">
            <div class="w-64 space-y-3">
                <div class="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span class="font-bold">XAF {{ number_format($booking->total_price, 2) }}</span>
                </div>
                @if($booking->discount_amount > 0)
                <div class="flex justify-between text-sm text-red-600">
                    <span>Discount</span>
                    <span class="font-bold">-XAF {{ number_format($booking->discount_amount, 2) }}</span>
                </div>
                @endif
                <div class="flex justify-between text-lg font-black text-[#2D5016] border-t-2 border-gray-100 pt-3">
                    <span>Grand Total</span>
                    <span>XAF {{ number_format($booking->total_price - $booking->discount_amount, 2) }}</span>
                </div>

                <!-- Payments Recap -->
                <div class="pt-4 space-y-1">
                    <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment History</h4>
                    @foreach($booking->payments as $payment)
                    <div class="flex justify-between text-[11px] text-gray-500 italic">
                        <span>{{ $payment->paid_at->format('M d') }} ({{ $payment->payment_method }})</span>
                        <span>-XAF {{ number_format($payment->amount, 2) }}</span>
                    </div>
                    @endforeach
                </div>

                <!-- Final Balance -->
                <div class="flex justify-between text-sm font-bold bg-gray-50 p-3 rounded-lg mt-4">
                    <span>Amount Due</span>
                    <span class="{{ ($booking->total_price - $booking->payments->sum('amount')) > 0 ? 'text-red-600' : 'text-green-600' }}">
                        XAF {{ number_format($booking->total_price - $booking->payments->sum('amount'), 2) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="mt-16 border-t border-gray-100 pt-8 text-center">
            <p class="text-sm font-bold text-gray-800 mb-1">Thank you for choosing Luxury Hotel!</p>
            <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">www.yourluxuryhotel.com • +237 000 000 000</p>

            <div class="mt-8 flex justify-center opacity-20 grayscale">
                <!-- Simple barcode or placeholder for QR code -->
                <div class="h-10 w-48 bg-black"></div>
            </div>
        </div>
    </div>

    <!-- Instructions for user -->
    <p class="text-center text-gray-400 text-[10px] mt-8 no-print uppercase tracking-widest">
        For best results, use a laser printer and set margins to 'None' in print settings.
    </p>

</body>
</html>
