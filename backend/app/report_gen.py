import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Draw header
        self.drawString(54, 750, "Digital Twin Dashboard for Smart Manufacturing - Status Report")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 742, 612-54, 742)
        
        # Draw footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_text)
        self.drawString(54, 36, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.line(54, 48, 612-54, 48)
        self.restoreState()

def generate_pdf_report(machines_data, filepath):
    """
    Generates a beautifully formatted PDF report from machine telemetry.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # 54pt margin (0.75 inch)
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#2563EB"),
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155")
    )
    
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=20
    )
    
    th_style = ParagraphStyle(
        'TableHeaderText',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )
    
    td_style = ParagraphStyle(
        'TableCellText',
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155")
    )
    
    story = []
    
    # Title & Metadata
    story.append(Spacer(1, 10))
    story.append(Paragraph("Smart Manufacturing Factory Health Report", title_style))
    story.append(Paragraph(f"Digital Twin Live Simulation Analysis  |  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", meta_style))
    
    # Factory Overview Statistics
    total = len(machines_data)
    healthy = sum(1 for m in machines_data if m['status'] == 'Healthy')
    warning = sum(1 for m in machines_data if m['status'] == 'Warning')
    critical = sum(1 for m in machines_data if m['status'] == 'Critical')
    
    # Table for Overview cards
    summary_data = [
        [
            Paragraph("<b>Total Machines</b>", td_style),
            Paragraph("<b>Healthy</b>", td_style),
            Paragraph("<b>Warning</b>", td_style),
            Paragraph("<b>Critical</b>", td_style)
        ],
        [
            Paragraph(f"<font size=14 color='#1E293B'><b>{total}</b></font>", td_style),
            Paragraph(f"<font size=14 color='#22C55E'><b>{healthy}</b></font>", td_style),
            Paragraph(f"<font size=14 color='#F59E0B'><b>{warning}</b></font>", td_style),
            Paragraph(f"<font size=14 color='#EF4444'><b>{critical}</b></font>", td_style)
        ]
    ]
    
    summary_table = Table(summary_data, colWidths=[1.25*inch]*4)
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F8FAFC")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    
    story.append(Paragraph("Factory Operations Summary", h2_style))
    story.append(summary_table)
    story.append(Spacer(1, 20))
    
    # Machine Details Section
    story.append(Paragraph("Machine Telemetry and Predictive Analysis", h2_style))
    
    for machine in machines_data:
        m_id = machine['id']
        name = machine['name']
        status = machine['status']
        health = machine['health_score']
        fail_prob = machine['failure_probability']
        
        status_color = "#22C55E" if status == "Healthy" else ("#F59E0B" if status == "Warning" else "#EF4444")
        
        # Machine header table
        hdr_data = [
            [
                Paragraph(f"<b>Machine {m_id} - {name}</b>", ParagraphStyle('mhdr', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=colors.HexColor("#1E293B"))),
                Paragraph(f"Status: <font color='{status_color}'><b>{status}</b></font>", ParagraphStyle('mstatus', fontName='Helvetica-Bold', fontSize=10, leading=12, alignment=2))
            ]
        ]
        hdr_table = Table(hdr_data, colWidths=[4*inch, 3*inch])
        hdr_table.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor("#2563EB")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(hdr_table)
        story.append(Spacer(1, 8))
        
        # Telemetry metrics table
        metrics_data = [
            [
                Paragraph("<b>Metric</b>", th_style), 
                Paragraph("<b>Current Value</b>", th_style), 
                Paragraph("<b>Metric</b>", th_style), 
                Paragraph("<b>Current Value</b>", th_style)
            ],
            [
                Paragraph("Air Temperature", td_style), Paragraph(f"{machine['air_temp']} K ({round(machine['air_temp'] - 273.15, 1)} °C)", td_style),
                Paragraph("Process Temperature", td_style), Paragraph(f"{machine['process_temp']} K ({round(machine['process_temp'] - 273.15, 1)} °C)", td_style)
            ],
            [
                Paragraph("Spindle Speed", td_style), Paragraph(f"{machine['rpm']} RPM", td_style),
                Paragraph("Torque", td_style), Paragraph(f"{machine['torque']} Nm", td_style)
            ],
            [
                Paragraph("Tool Wear", td_style), Paragraph(f"{machine['tool_wear']} min", td_style),
                Paragraph("Failure Probability", td_style), Paragraph(f"{fail_prob}%", td_style)
            ],
            [
                Paragraph("Machine Health", td_style), Paragraph(f"<b>{health}%</b>", td_style),
                Paragraph("-", td_style), Paragraph("-", td_style)
            ]
        ]
        
        metrics_table = Table(metrics_data, colWidths=[1.75*inch, 1.75*inch, 1.75*inch, 1.75*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2563EB")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 8))
        
        # Recommendations & Action Items
        rec_data = [
            [
                Paragraph("<b>Predictive Action Recommendation:</b>", ParagraphStyle('rcTitle', fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=colors.HexColor("#1E293B"))),
            ],
            [
                Paragraph(machine['recommendation'] if 'recommendation' in machine else "Run diagnostic scans.", ParagraphStyle('rcDesc', fontName='Helvetica-Oblique', fontSize=9, leading=12, textColor=colors.HexColor("#334155"))),
            ]
        ]
        rec_table = Table(rec_data, colWidths=[7*inch])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BFDBFE")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(rec_table)
        story.append(Spacer(1, 15))
        
    doc.build(story, canvasmaker=NumberedCanvas)
