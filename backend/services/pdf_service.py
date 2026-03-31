"""
Driver Pay Report PDF Generator
Produces professional settlement sheets matching industry-standard TMS layouts.
"""
import os
from datetime import datetime
from jinja2 import Template
try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False

COMPANY_NAME = os.getenv("COMPANY_NAME", "Uzloads Logistics LLC")
COMPANY_ADDRESS = os.getenv("COMPANY_ADDRESS", "123 Freight Ave, Chicago, IL 60601")
COMPANY_PHONE = os.getenv("COMPANY_PHONE", "(312) 555-0100")
COMPANY_EMAIL = os.getenv("COMPANY_EMAIL", "settlements@uzloads.com")
COMPANY_MC = os.getenv("COMPANY_MC", "MC-123456")
COMPANY_DOT = os.getenv("COMPANY_DOT", "DOT-654321")

SETTLEMENT_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 9pt;
    color: #1A1A1A;
    background: #fff;
    padding: 32px 36px;
  }

  /* ── HEADER ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #0052FF;
    padding-bottom: 16px;
    margin-bottom: 20px;
  }
  .company-name {
    font-size: 18pt;
    font-weight: 700;
    color: #0052FF;
    letter-spacing: -0.5px;
  }
  .company-sub {
    font-size: 8pt;
    color: #666;
    margin-top: 3px;
  }
  .doc-info {
    text-align: right;
  }
  .doc-title {
    font-size: 13pt;
    font-weight: 700;
    color: #1A1A1A;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .doc-number {
    font-size: 9pt;
    color: #0052FF;
    font-weight: 600;
    margin-top: 4px;
  }
  .doc-date {
    font-size: 8pt;
    color: #666;
    margin-top: 2px;
  }

  /* ── INFO BLOCK ── */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
  .info-box {
    background: #F7F9FF;
    border: 1px solid #E0E8FF;
    border-radius: 4px;
    padding: 12px 14px;
  }
  .info-box-label {
    font-size: 7pt;
    font-weight: 600;
    color: #0052FF;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }
  .info-key { color: #555; font-size: 8pt; }
  .info-val { font-weight: 600; font-size: 8pt; color: #1A1A1A; }

  /* ── LOADS TABLE ── */
  .section-title {
    font-size: 9pt;
    font-weight: 700;
    color: #1A1A1A;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #E0E0E0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18px;
  }
  thead tr {
    background: #0052FF;
    color: #fff;
  }
  thead th {
    padding: 7px 8px;
    text-align: left;
    font-size: 7.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tbody tr {
    border-bottom: 1px solid #F0F0F0;
  }
  tbody tr:nth-child(even) {
    background: #FAFBFF;
  }
  tbody td {
    padding: 6px 8px;
    font-size: 8pt;
    color: #1A1A1A;
  }
  .text-right { text-align: right; }
  .text-center { text-align: center; }

  tfoot tr {
    background: #F7F9FF;
    border-top: 2px solid #0052FF;
  }
  tfoot td {
    padding: 7px 8px;
    font-weight: 700;
    font-size: 8.5pt;
  }

  /* ── FINANCIAL SUMMARY ── */
  .financial-block {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  .financial-table {
    width: 320px;
    border: 1px solid #E0E8FF;
    border-radius: 4px;
    overflow: hidden;
  }
  .fin-header {
    background: #0052FF;
    color: #fff;
    padding: 8px 12px;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .fin-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px solid #F0F0F0;
    font-size: 8.5pt;
  }
  .fin-row:last-child { border-bottom: none; }
  .fin-row.deduction { color: #C0392B; }
  .fin-row.deduction .fin-amount { color: #C0392B; }
  .fin-row.subtotal {
    background: #F7F9FF;
    font-weight: 600;
    border-top: 1px solid #E0E8FF;
  }
  .fin-row.grand-total {
    background: #0052FF;
    color: #fff;
    font-weight: 700;
    font-size: 10pt;
    padding: 10px 12px;
  }
  .fin-label { color: inherit; }
  .fin-amount { font-weight: 600; }

  /* ── FOOTER ── */
  .footer {
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid #E0E0E0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .signature-block {
    width: 220px;
  }
  .signature-line {
    border-bottom: 1px solid #1A1A1A;
    margin-bottom: 4px;
    height: 32px;
  }
  .signature-label { font-size: 7.5pt; color: #666; }
  .footer-note {
    font-size: 7pt;
    color: #999;
    text-align: right;
    max-width: 260px;
  }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div>
    <div class="company-name">{{ company_name }}</div>
    <div class="company-sub">{{ company_address }}<br>{{ company_phone }} · {{ company_email }}<br>{{ company_mc }} · {{ company_dot }}</div>
  </div>
  <div class="doc-info">
    <div class="doc-title">Driver Pay Report</div>
    <div class="doc-number">Settlement #{{ settlement.settlement_number }}</div>
    <div class="doc-date">Generated: {{ generated_date }}</div>
  </div>
</div>

<!-- INFO GRID -->
<div class="info-grid">
  <div class="info-box">
    <div class="info-box-label">Driver Information</div>
    <div class="info-row"><span class="info-key">Name</span><span class="info-val">{{ driver.first_name }} {{ driver.last_name }}</span></div>
    <div class="info-row"><span class="info-key">Phone</span><span class="info-val">{{ driver.phone or '—' }}</span></div>
    <div class="info-row"><span class="info-key">Truck #</span><span class="info-val">{{ driver.truck_number or '—' }}</span></div>
    <div class="info-row"><span class="info-key">Trailer #</span><span class="info-val">{{ driver.trailer_number or '—' }}</span></div>
  </div>
  <div class="info-box">
    <div class="info-box-label">Phase Details</div>
    <div class="info-row"><span class="info-key">Phase</span><span class="info-val">{{ settlement.phase_label }}</span></div>
    <div class="info-row"><span class="info-key">From</span><span class="info-val">{{ settlement.phase_start_date.strftime('%m/%d/%Y') }}</span></div>
    <div class="info-row"><span class="info-key">To</span><span class="info-val">{{ settlement.phase_end_date.strftime('%m/%d/%Y') }}</span></div>
    <div class="info-row"><span class="info-key">Pay Rate</span><span class="info-val">{{ "%.0f"|format(driver.pay_rate * 100) }}%</span></div>
  </div>
</div>

<!-- LOADS TABLE -->
<div class="section-title">Load Details</div>
<table>
  <thead>
    <tr>
      <th>Load #</th>
      <th>Pickup</th>
      <th>Delivery</th>
      <th>Broker</th>
      <th>Miles</th>
      <th class="text-right">Rate</th>
      <th class="text-right">Fuel Sur.</th>
      <th class="text-right">Detention</th>
      <th class="text-right">Total</th>
    </tr>
  </thead>
  <tbody>
    {% for load in loads %}
    <tr>
      <td>{{ load.load_number }}</td>
      <td>{{ load.pickup_city }}, {{ load.pickup_state }}<br><span style="color:#888;font-size:7.5pt">{{ load.pickup_date.strftime('%m/%d/%y') }}</span></td>
      <td>{{ load.delivery_city }}, {{ load.delivery_state }}<br><span style="color:#888;font-size:7.5pt">{{ load.delivery_date.strftime('%m/%d/%y') }}</span></td>
      <td>{{ load.broker_name or '—' }}</td>
      <td class="text-center">{{ load.miles or '—' }}</td>
      <td class="text-right">${{ "%.2f"|format(load.rate) }}</td>
      <td class="text-right">${{ "%.2f"|format(load.fuel_surcharge) }}</td>
      <td class="text-right">${{ "%.2f"|format(load.detention) }}</td>
      <td class="text-right">${{ "%.2f"|format(load.total_rate) }}</td>
    </tr>
    {% endfor %}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="5">Total ({{ loads|length }} load{{ 's' if loads|length != 1 else '' }})</td>
      <td class="text-right">${{ "%.2f"|format(settlement.gross_revenue) }}</td>
      <td class="text-right"></td>
      <td class="text-right"></td>
      <td class="text-right">${{ "%.2f"|format(settlement.gross_revenue) }}</td>
    </tr>
  </tfoot>
</table>

<!-- FINANCIAL SUMMARY -->
<div class="financial-block">
  <div class="financial-table">
    <div class="fin-header">Pay Calculation</div>
    <div class="fin-row">
      <span class="fin-label">Gross Revenue</span>
      <span class="fin-amount">${{ "%.2f"|format(settlement.gross_revenue) }}</span>
    </div>
    <div class="fin-row">
      <span class="fin-label">Driver Rate ({{ "%.0f"|format(settlement.driver_percentage * 100) }}%)</span>
      <span class="fin-amount">${{ "%.2f"|format(settlement.driver_gross) }}</span>
    </div>

    {% if deductions.fuel %}
    <div class="fin-row deduction">
      <span class="fin-label">— Fuel</span>
      <span class="fin-amount">(${{ "%.2f"|format(deductions.fuel) }})</span>
    </div>
    {% endif %}
    {% if deductions.eld %}
    <div class="fin-row deduction">
      <span class="fin-label">— ELD Fee</span>
      <span class="fin-amount">(${{ "%.2f"|format(deductions.eld) }})</span>
    </div>
    {% endif %}
    {% if deductions.insurance %}
    <div class="fin-row deduction">
      <span class="fin-label">— Insurance</span>
      <span class="fin-amount">(${{ "%.2f"|format(deductions.insurance) }})</span>
    </div>
    {% endif %}
    {% if deductions.ifta %}
    <div class="fin-row deduction">
      <span class="fin-label">— IFTA</span>
      <span class="fin-amount">(${{ "%.2f"|format(deductions.ifta) }})</span>
    </div>
    {% endif %}
    {% if deductions.admin %}
    <div class="fin-row deduction">
      <span class="fin-label">— Admin Fee</span>
      <span class="fin-amount">(${{ "%.2f"|format(deductions.admin) }})</span>
    </div>
    {% endif %}
    {% if deductions.other %}
    <div class="fin-row deduction">
      <span class="fin-label">— {{ deductions.other_label or 'Other' }}</span>
      <span class="fin-amount">(${{ "%.2f"|format(deductions.other) }})</span>
    </div>
    {% endif %}

    <div class="fin-row subtotal">
      <span class="fin-label">Total Deductions</span>
      <span class="fin-amount">(${{ "%.2f"|format(settlement.total_deductions) }})</span>
    </div>
    <div class="fin-row grand-total">
      <span class="fin-label">GRAND TOTAL</span>
      <span class="fin-amount">${{ "%.2f"|format(settlement.grand_total) }}</span>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-label">Driver Signature / Date</div>
    </div>
  </div>
  <div class="footer-note">
    This document is an official settlement statement from {{ company_name }}.<br>
    Please retain for your records. Questions? Contact {{ company_email }}
  </div>
</div>

</body>
</html>
"""


def generate_settlement_pdf(settlement, driver, loads, output_path: str) -> str:
    if not WEASYPRINT_AVAILABLE:
        print("WeasyPrint not installed, skipping PDF generation")
        return output_path

    template = Template(SETTLEMENT_HTML)
    html_content = template.render(
        company_name=COMPANY_NAME,
        company_address=COMPANY_ADDRESS,
        company_phone=COMPANY_PHONE,
        company_email=COMPANY_EMAIL,
        company_mc=COMPANY_MC,
        company_dot=COMPANY_DOT,
        generated_date=datetime.now().strftime("%B %d, %Y at %I:%M %p"),
        settlement=settlement,
        driver=driver,
        loads=loads,
        deductions=deductions_obj,
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    HTML(string=html_content).write_pdf(output_path)
    return output_path
