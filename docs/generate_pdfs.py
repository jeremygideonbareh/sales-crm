from fpdf import FPDF
from pathlib import Path

FONT_DIR = "C:/Windows/Fonts"
FONT_REGULAR = f"{FONT_DIR}/segoeui.ttf"
FONT_BOLD = f"{FONT_DIR}/segoeuib.ttf"
FONT_ITALIC = f"{FONT_DIR}/segoeuii.ttf"
FONT_BI = f"{FONT_DIR}/segoeuiz.ttf"

OUTPUT_DIR = Path(__file__).parent


class PDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("Segoe", "B", 8)
            self.set_text_color(140, 140, 140)
            self.cell(0, 6, "Agency Sales CRM", align="L")
            self.cell(0, 6, f"Page {self.page_no()}/{{nb}}", align="R", new_x="LMARGIN", new_y="NEXT")
            self.line(10, 14, 200, 14)
            self.ln(4)

    def footer(self):
        self.set_y(-12)
        self.set_font("Segoe", "", 7)
        self.set_text_color(160, 160, 160)
        self.cell(0, 8, "Confidential - For Authorized Users Only", align="C")

    def title_page(self, title, subtitle, date_str=""):
        self.set_y(60)
        self.set_font("Segoe", "B", 28)
        self.set_text_color(20, 80, 60)
        self.multi_cell(0, 14, title, align="C")
        self.ln(6)
        self.set_font("Segoe", "", 14)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 8, subtitle, align="C")
        if date_str:
            self.ln(8)
            self.set_font("Segoe", "", 10)
            self.set_text_color(140, 140, 140)
            self.cell(0, 6, date_str, align="C")
        self.ln(20)
        self.set_font("Segoe", "I", 10)
        self.set_text_color(120, 120, 120)
        self.multi_cell(0, 6, "Sales CRM - Agency Dashboard", align="C")

    def section_title(self, num, title):
        self.ln(4)
        self.set_font("Segoe", "B", 16)
        self.set_text_color(20, 80, 60)
        self.cell(0, 10, f"{num}. {title}", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(20, 80, 60)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def subsection_title(self, title):
        self.ln(2)
        self.set_font("Segoe", "B", 12)
        self.set_text_color(30, 60, 50)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text):
        self.set_x(self.l_margin)
        self.set_font("Segoe", "", 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def bullet(self, text, indent=10):
        self.set_font("Segoe", "", 10)
        self.set_text_color(40, 40, 40)
        x0 = self.l_margin + indent
        self.set_x(x0)
        w = self.w - self.r_margin - x0
        self.cell(5, 5.5, chr(8226))
        self.multi_cell(w - 5, 5.5, text)
        self.set_x(self.l_margin)

    def bullet_bold_lead(self, bold_part, rest, indent=10):
        self.set_x(self.l_margin + indent)
        self.set_font("Segoe", "", 10)
        self.set_text_color(40, 40, 40)
        w = self.w - self.r_margin - self.l_margin - indent
        self.cell(5, 5.5, chr(8226))
        self.set_font("Segoe", "B", 10)
        self.write(5.5, bold_part + ": ")
        self.set_font("Segoe", "", 10)
        self.multi_cell(w - 5, 5.5, rest)

    def tip_box(self, title, text):
        self.ln(2)
        self.set_fill_color(230, 245, 235)
        self.set_draw_color(20, 120, 80)
        self.set_line_width(0.4)
        self.set_font("Segoe", "B", 10)
        self.set_text_color(20, 80, 60)
        self.cell(0, 6, f"  {title}", new_x="LMARGIN", new_y="NEXT", fill=True)
        self.set_font("Segoe", "", 9.5)
        self.set_text_color(40, 60, 50)
        self.set_x(self.l_margin)
        self.multi_cell(0, 5, f"  {text}", fill=True)
        self.set_line_width(0.2)
        self.ln(2)

    def table_row(self, cells, bold=False, fill=False, widths=None):
        self.set_font("Segoe", "B" if bold else "", 9)
        self.set_text_color(40, 40, 40)
        if fill:
            self.set_fill_color(230, 240, 235)
        if widths is None:
            widths = [190 / len(cells)] * len(cells)
        for i, cell in enumerate(cells):
            self.cell(widths[i], 6, f" {cell}", border=1, fill=fill)
        self.ln()


def build_sales_guide(pdf):
    pdf.add_page()
    pdf.title_page(
        "Sales Representative Guide",
        "How to use the Agency Sales CRM\nto manage leads, track calls, and close deals",
        "July 2026"
    )

    # --- TABLE OF CONTENTS ---
    pdf.add_page()
    pdf.set_font("Segoe", "B", 16)
    pdf.set_text_color(20, 80, 60)
    pdf.cell(0, 10, "Table of Contents", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    toc = [
        ("1", "Getting Started"),
        ("2", "Your Dashboard - Tracking Your Performance"),
        ("3", "Calling Leads - The Calling Queue"),
        ("4", "Managing Demo Requests"),
        ("5", "Client Handovers to the Dev Team"),
        ("6", "Pipeline Stages Explained"),
        ("7", "Notifications"),
        ("8", "Settings - Managing Your Account"),
        ("9", "Quick Reference"),
    ]
    for num, title in toc:
        pdf.set_font("Segoe", "", 11)
        pdf.set_text_color(40, 40, 40)
        pdf.cell(10, 7, num + ".")
        pdf.set_font("Segoe", "B", 11)
        pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")

    # --- 1. GETTING STARTED ---
    pdf.add_page()
    pdf.section_title("1", "Getting Started")

    pdf.subsection_title("1.1 Logging In")
    pdf.body_text(
        "Open the CRM in your browser. On the login screen, enter your email address and password "
        "provided by your manager. Click \"Sign In\" to access the dashboard."
    )
    pdf.bullet("Email: your email address (e.g. ashba@agency.com)")
    pdf.bullet("Password: provided by your manager")
    pdf.body_text(
        "After signing in, you will be automatically redirected to your personal Sales Rep Dashboard."
    )

    pdf.subsection_title("1.2 Navigation")
    pdf.body_text(
        "The sidebar on the left (or the bottom navigation bar on mobile) gives you access to all features:"
    )
    pdf.bullet("Dashboard - Your personal performance overview")
    pdf.bullet("Calling - The lead calling workspace")
    pdf.bullet("Demo Requests - Manage client demo appointments")
    pdf.bullet("Handovers - Handoff clients to the development team")
    pdf.bullet("Settings - Update your password")
    pdf.body_text(
        "On the sidebar, you will also see a Sun/Moon icon to toggle between light and dark mode, "
        "and a Sign Out button at the bottom."
    )

    pdf.tip_box("TIP:", "Use the sidebar to quickly switch between sections. The active page is highlighted in green.")

    # --- 2. DASHBOARD ---
    pdf.add_page()
    pdf.section_title("2", "Your Dashboard")

    pdf.body_text(
        "Your Dashboard is your personal command center. It shows your performance at a glance:"
    )

    pdf.subsection_title("2.1 KPI Cards (Top Row)")
    pdf.bullet("Total Calls - How many calls you have made overall")
    pdf.bullet("Success Rate (%) - Percentage of calls that resulted in a deal")
    pdf.bullet("Deals Closed - Total number of deals you have closed")
    pdf.bullet("Commission ($) - Your total earned commission (20% of deal values)")

    pdf.subsection_title("2.2 My Pipeline Chart")
    pdf.body_text(
        "A horizontal bar chart showing how many leads you have at each pipeline stage. "
        "This helps you visualize your sales funnel at a glance."
    )

    pdf.subsection_title("2.3 Pipeline Stage Cards")
    pdf.body_text(
        "Below the chart, each pipeline stage is displayed as a card with the stage name, "
        "lead count, and a progress bar showing relative proportion of your total leads."
    )

    pdf.subsection_title("2.4 Recent Activity")
    pdf.body_text(
        "A chronological list of your recent call activities showing the business name, "
        "the outcome status, and the date/time of each call."
    )

    pdf.tip_box("TIP:", "Check your dashboard every morning to see where you stand and plan your day.")

    # --- 3. CALLING ---
    pdf.add_page()
    pdf.section_title("3", "Calling Leads")

    pdf.body_text(
        "The Calling page is your main workspace for contacting leads. Unlike a simple queue "
        "that shows one lead at a time, you can now see ALL your assigned leads, choose which "
        "one to call, and view complete business details alongside the call interface."
    )

    pdf.subsection_title("3.1 Layout Overview")
    pdf.body_text(
        "The Calling page has a split layout that adapts to your device:"
    )
    pdf.bullet_bold_lead("Desktop (tablet or wider)", " A lead list appears on the left sidebar. "
        "Click any lead to view their details and call interface on the right.")
    pdf.bullet_bold_lead("Mobile (phone)", " A horizontal scrollable row of lead pills appears at the top. "
        "Tap a pill to select that lead. Tap \"All Leads\" to open a full list in a bottom drawer.")
    pdf.body_text(
        "The selected lead shows a status badge in the top-right header next to the call timer."
    )

    pdf.subsection_title("3.2 The Lead List (Choosing Who to Call)")
    pdf.body_text(
        "The lead list shows all leads assigned to you, ordered by priority (uncalled leads first, "
        "then by most recent activity). Each entry displays:"
    )
    pdf.bullet("Business name and contact person")
    pdf.bullet("A colored status dot (green = interested, amber = no answer, etc.)")
    pdf.bullet("Number of previous calls made to this lead (if any)")
    pdf.bullet("An arrow indicator on the currently selected lead")
    pdf.body_text(
        "On mobile, tap \"All Leads\" to open the lead picker drawer from the bottom of the screen. "
        "This drawer shows the full list with status badges for easy scanning. Tap any lead to select it."
    )

    pdf.subsection_title("3.3 Lead Detail Card")
    pdf.body_text(
        "When a lead is selected, a detail card shows all relevant information:"
    )
    pdf.bullet_bold_lead("Phone Number", " Shown in large bold text with a formatted number. "
        "Tap the green \"Call Now\" button to initiate a phone call via your device's dialer. "
        "Use the copy button next to it to copy the number to your clipboard.")
    pdf.bullet_bold_lead("Email", " Shown as a clickable link that opens your email client.")
    pdf.bullet_bold_lead("Website", " Shown as a clickable link that opens in a new browser tab.")
    pdf.bullet_bold_lead("Deal Value", " If a deal value has been set, it is displayed with the commission percentage.")
    pdf.bullet_bold_lead("Created Date", " When this lead was added to the system.")
    pdf.body_text(
        "Below the detail card, any existing notes for the lead are displayed. "
        "On mobile, you can also see a \"Switch Lead\" horizontal scroll section for quick navigation."
    )

    pdf.subsection_title("3.4 Call Timer")
    pdf.body_text(
        "A timer in the header starts when you select a lead. It shows minutes:seconds and changes color:"
    )
    pdf.bullet("Green: Under 30 seconds (quick call)")
    pdf.bullet("Amber: 30 seconds to 2 minutes")
    pdf.bullet("Red: Over 2 minutes")
    pdf.body_text(
        "The timer resets when you switch to a different lead."
    )

    pdf.subsection_title("3.5 Logging an Outcome (Desktop)")
    pdf.body_text(
        "On desktop, the outcome buttons are shown directly below the lead detail card in a grid:"
    )
    pdf.bullet("No Answer - The lead did not answer (will reappear for follow-up)")
    pdf.bullet("Not Interested - The lead declined")
    pdf.bullet("Interested - The lead showed interest (prompt to schedule a demo)")
    pdf.bullet("Pitching - You are actively pitching to this lead")
    pdf.bullet("Demo Scheduled - A demo has been booked")
    pdf.bullet("Negotiation - Price and terms being negotiated")
    pdf.body_text(
        "Below the grid, a \"Deal Closed\" button opens a deal value input. "
        "Enter the amount and confirm. Your 20% commission is calculated automatically."
    )
    pdf.body_text(
        "A notes textarea below the buttons lets you record call details before saving."
    )

    pdf.subsection_title("3.6 Logging an Outcome (Mobile)")
    pdf.body_text(
        "On mobile, a sticky \"Log Outcome\" button sits at the bottom of the screen. "
        "Tap it to open a bottom drawer with all outcome options:"
    )
    pdf.bullet("Six outcome buttons arranged in a 2-column grid")
    pdf.bullet("A full-width \"Deal Closed\" button at the bottom of the grid")
    pdf.bullet("A notes textarea and a \"Save Outcome\" button")
    pdf.body_text(
        "The outcome drawer slides up from the bottom of the screen and can be dismissed by tapping "
        "outside it or pressing the Escape key."
    )

    pdf.subsection_title("3.7 Closing a Deal")
    pdf.body_text(
        "When a lead agrees to purchase, select \"Deal Closed\". Enter the deal amount and confirm. "
        "Your 20% commission is calculated automatically. A confetti animation celebrates the closed deal!"
    )

    pdf.subsection_title("3.8 Notes")
    pdf.body_text(
        "Notes help you remember important details about each call. On desktop, the notes textarea "
        "is shown alongside the outcome buttons. On mobile, it appears inside the outcome drawer. "
        "Notes are saved with the call log and can be reviewed later."
    )

    pdf.subsection_title("3.9 Call Info Badges")
    pdf.body_text(
        "Below the lead detail card, small badges show useful statistics:"
    )
    pdf.bullet_bold_lead("Call count", " How many times this lead has been called")
    pdf.bullet_bold_lead("Last call time", " How long ago the last call was (e.g. \"2h ago\", \"3d ago\")")

    pdf.subsection_title("3.10 Empty State")
    pdf.body_text(
        "When you have no assigned leads, a clean \"All Caught Up!\" message is displayed "
        "with a checkmark icon. Leads appear here as soon as your manager assigns them to you."
    )

    pdf.tip_box("PRO TIP:", "Always add notes to your calls. Good notes help your manager and the dev team understand the client's needs.")

    # --- 4. DEMO REQUESTS ---
    pdf.add_page()
    pdf.section_title("4", "Managing Demo Requests")

    pdf.body_text(
        "When a lead is interested, you can schedule a product demo for them. "
        "The Demo Requests page lets you create, track, and manage all demo appointments."
    )

    pdf.subsection_title("4.1 Creating a Demo Request")
    pdf.bullet("Click the \"New Demo Request\" button")
    pdf.bullet("Select the client from the dropdown (shows active leads only)")
    pdf.bullet("Enter a Demo Title (e.g. \"Walkthrough - SEO Package\")")
    pdf.bullet("Add a Description of what the demo will cover")
    pdf.bullet("Set a Scheduled Date and Time using the datetime picker")
    pdf.bullet("Add any Notes")
    pdf.bullet("Click \"Create Demo Request\"")
    pdf.body_text(
        "When you create a demo request, the lead's status automatically advances to \"Demo Scheduled\"."
    )

    pdf.subsection_title("4.2 Managing Demo Statuses")
    pdf.body_text("Each demo request has a status that you can update:")
    pdf.bullet("Pending (amber) - Newly created, not yet scheduled")
    pdf.bullet("Scheduled (blue) - A date/time has been set")
    pdf.bullet("Completed (green) - The demo took place successfully")
    pdf.bullet("Cancelled (red) - The demo was cancelled")

    pdf.subsection_title("4.3 Updating Demo Status")
    pdf.body_text("From the demo list, use the action buttons next to each demo:")
    pdf.bullet("Pending -> Click \"Schedule\" to set a date, or \"Cancel\" to cancel")
    pdf.bullet("Scheduled -> Click \"Mark Completed\" once the demo is done")
    pdf.body_text(
        "When you mark a demo as completed, the lead's status advances to \"Demo Completed\" automatically."
    )

    pdf.tip_box("TIP:", "Always set a scheduled date when creating a demo. This helps everyone stay organized.")

    # --- 5. HANDOVERS ---
    pdf.add_page()
    pdf.section_title("5", "Client Handovers")

    pdf.body_text(
        "When a client is ready to start work, you hand them over to the development team. "
        "The Handovers page manages this transition."
    )

    pdf.subsection_title("5.1 Creating a Handover")
    pdf.bullet("Click the \"New Handover\" button")
    pdf.bullet("Select the client (only eligible clients are shown)")
    pdf.bullet("Fill in the handover details:")
    pdf.bullet("Client Brief - Summary of the client and their needs")
    pdf.bullet("Technical Requirements - What the dev team needs to build")
    pdf.bullet("Design Preferences - Visual style, branding, references")
    pdf.bullet("Timeline Notes - Deadlines and milestones")
    pdf.bullet("Budget - The agreed budget amount")
    pdf.bullet("Additional Notes - Anything else the dev team should know")
    pdf.bullet("Click \"Handover to Dev Team\" to submit")
    pdf.body_text(
        "When a handover is created, the lead status automatically advances to \"In Progress\". "
        "The system prevents duplicate handovers for the same client."
    )

    pdf.subsection_title("5.2 Eligible Clients")
    pdf.body_text(
        "Only clients at specific stages can be handed over: Onboarding, Deposit Paid, Negotiation, "
        "Interested, or Demo Completed."
    )

    pdf.subsection_title("5.3 Handover List")
    pdf.body_text(
        "Your handovers are listed as cards showing: client name, status (Pending/Completed), "
        "client brief, requirements, budget, timeline notes, and creation date."
    )

    pdf.tip_box("REMINDER:", "A good handover makes the dev team's job easier. Include as much detail as possible.")

    # --- 6. PIPELINE STAGES ---
    pdf.add_page()
    pdf.section_title("6", "Pipeline Stages Explained")

    pdf.body_text(
        "Each lead progresses through a series of stages in your sales pipeline. "
        "Here is the complete journey from start to finish:"
    )

    stages = [
        ("Uncalled", "New lead assigned to you, not yet contacted"),
        ("No Answer", "You called but the lead did not answer"),
        ("Not Interested", "The lead declined your offer"),
        ("Interested", "The lead showed interest - next step is a demo"),
        ("Pitching", "You are actively pitching to this lead"),
        ("Demo Scheduled", "A demo appointment has been booked"),
        ("Demo Completed", "The demo has taken place"),
        ("Negotiation", "Price and terms are being negotiated"),
        ("Onboarding", "The client is being onboarded"),
        ("Deposit Paid", "The client has paid a deposit"),
        ("In Progress", "The project is in progress (post-handover)"),
        ("Deal Closed!", "Congratulations! The deal is closed and commission is earned"),
    ]
    for i, (stage, desc) in enumerate(stages, 1):
        pdf.set_font("Segoe", "B", 10)
        pdf.set_text_color(20, 80, 60)
        pdf.cell(5, 6, str(i) + ".")
        pdf.cell(45, 6, stage)
        pdf.set_font("Segoe", "", 10)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 6, f" - {desc}")
        pdf.ln(0.5)

    pdf.subsection_title("Commission")
    pdf.body_text(
        "When a deal is closed, you earn 20% commission on the deal value. "
        "The commission is calculated automatically when you mark a deal as closed in the Calling View."
    )

    # --- 7. NOTIFICATIONS ---
    pdf.add_page()
    pdf.section_title("7", "Notifications")

    pdf.body_text(
        "The notification system keeps you informed about important events. "
        "Look for the bell icon in the top bar (desktop) or mobile header."
    )

    pdf.bullet("A red badge on the bell shows your unread count (max \"9+\")")
    pdf.bullet("Click the bell to open the notification dropdown")
    pdf.bullet("Click \"Mark all read\" to clear all notifications")
    pdf.bullet("Click individual notifications to mark them as read")
    pdf.body_text("You will receive notifications for:")
    pdf.bullet("New leads assigned to you")
    pdf.bullet("Demo created, scheduled, or completed")
    pdf.bullet("Handover created or completed")
    pdf.bullet("Deal closed")
    pdf.body_text(
        "The system checks for new notifications every 30 seconds automatically."
    )

    # --- 8. SETTINGS ---
    pdf.add_page()
    pdf.section_title("8", "Settings - Managing Your Account")

    pdf.body_text(
        "The Settings page lets you view your profile information and change your password."
    )

    pdf.subsection_title("8.1 Profile")
    pdf.body_text("Displays your name, email address, and role (Sales Rep). This information is read-only.")

    pdf.subsection_title("8.2 Changing Your Password")
    pdf.bullet("Enter your current password")
    pdf.bullet("Enter your new password (minimum 8 characters)")
    pdf.bullet("Confirm your new password")
    pdf.bullet("Click \"Change Password\"")
    pdf.body_text(
        "Your password must be at least 8 characters long and include uppercase, lowercase, and a number."
    )

    pdf.tip_box("SECURITY:", "Change your password regularly. Never share your password with anyone.")

    # --- 9. QUICK REFERENCE ---
    pdf.add_page()
    pdf.section_title("9", "Quick Reference")

    pdf.subsection_title("Key Shortcuts & Tips")
    pdf.bullet("Check your Dashboard first thing every day")
    pdf.bullet("Always take notes during calls - they help everyone")
    pdf.bullet("Interested lead? Create a demo right away (use the banner CTA in Calling View)")
    pdf.bullet("Handover ready? Include full detail: brief, requirements, design, budget, timeline")
    pdf.bullet("Use the copy phone button to quickly dial from your phone")
    pdf.bullet("Toggle dark/light mode with the Sun/Moon icon in the sidebar")

    pdf.subsection_title("Lead Status Flow")
    pdf.set_font("Segoe", "I", 9)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(0, 5, "Uncalled -> Calling -> Interested -> Demo Scheduled -> Demo Completed -> Handover -> In Progress -> Deal Closed")
    pdf.ln(4)

    pdf.subsection_title("Commission Structure")
    pdf.body_text("20% of deal value, automatically calculated when you close a deal.")

    pdf.subsection_title("Need Help?")
    pdf.body_text("Contact your manager for any questions, issues, or access problems.")


def build_admin_guide(pdf):
    pdf.add_page()
    pdf.title_page(
        "Agency Owner & Manager Guide",
        "Complete guide to managing your agency\nthrough the Sales CRM dashboard",
        "July 2026"
    )

    # --- TABLE OF CONTENTS ---
    pdf.add_page()
    pdf.set_font("Segoe", "B", 16)
    pdf.set_text_color(20, 80, 60)
    pdf.cell(0, 10, "Table of Contents", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    toc = [
        ("1", "Getting Started & First Login"),
        ("2", "The Manager Dashboard - Agency Overview"),
        ("3", "Managing Leads - Upload, Assign & Filter"),
        ("4", "Leaderboard - Tracking Rep Performance"),
        ("5", "Admin Users - Managing Your Team"),
        ("6", "Pipeline Overview"),
        ("7", "Email Sequences - Automated Follow-ups"),
        ("8", "Settings - Managing Your Account"),
        ("9", "Notifications"),
        ("10", "Technical Reference - Deployment & Maintenance"),
    ]
    for num, title in toc:
        pdf.set_font("Segoe", "", 11)
        pdf.set_text_color(40, 40, 40)
        pdf.cell(10, 7, num + ".")
        pdf.set_font("Segoe", "B", 11)
        pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")

    # --- 1. GETTING STARTED ---
    pdf.add_page()
    pdf.section_title("1", "Getting Started & First Login")

    pdf.subsection_title("1.1 Accessing the CRM")
    pdf.body_text(
        "Open the CRM URL in your browser. On the login screen, sign in with your manager credentials."
    )

    pdf.subsection_title("1.2 Login Credentials")
    pdf.body_text(
        "Use the credentials provided by your system administrator to sign in. "
        "The following accounts are available:"
    )
    pdf.set_font("Segoe", "B", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 6, "Manager Account:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Segoe", "", 10)
    pdf.cell(0, 6, "   admin@agency.com / @Admin12345", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("Segoe", "B", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 6, "Sales Reps:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Segoe", "", 10)
    pdf.cell(0, 6, "   ashba@agency.com / @Admin12345", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "   jai@agency.com / @Admin12345", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "   agnas@agency.com / @Admin12345", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    pdf.tip_box("IMPORTANT:", "Change the default passwords immediately after first login, especially the admin account.")

    pdf.subsection_title("1.3 Navigation for Managers")
    pdf.body_text("After signing in, you are redirected to the Manager Dashboard. The sidebar includes:")
    pdf.bullet("Dashboard - Agency performance overview")
    pdf.bullet("Leads - Full lead management (upload, assign, filter, export)")
    pdf.bullet("Leaderboard - Rep performance rankings")
    pdf.bullet("Users - Manage team members (add/deactivate)")
    pdf.bullet("Settings - Change your password")

    # --- 2. MANAGER DASHBOARD ---
    pdf.add_page()
    pdf.section_title("2", "The Manager Dashboard")

    pdf.body_text(
        "The Manager Dashboard gives you a real-time overview of your entire agency's performance."
    )

    pdf.subsection_title("2.1 KPI Cards")
    pdf.bullet("Total Calls - Total calls made by all reps")
    pdf.bullet("Success Rate - Overall percentage of calls that resulted in deals")
    pdf.bullet("Deals Closed - Total deals closed across the agency")
    pdf.bullet("Commissions Owed - Total commission earned by all reps")

    pdf.subsection_title("2.2 Date Range Filter")
    pdf.body_text(
        "Use the 7D, 30D, 90D, or All buttons to filter the displayed data by time period."
    )

    pdf.subsection_title("2.3 Charts & Visualizations")
    pdf.bullet("Calls by Rep - Bar chart comparing calls and deals per rep")
    pdf.bullet("Weekly Trend - Area chart showing call activity over the week")
    pdf.bullet("Lead Distribution - Pie chart showing lead status distribution")

    pdf.subsection_title("2.4 Rep Performance Table")
    pdf.body_text(
        "A table listing each rep with: leads count, calls made, deals closed, success rate "
        "(shown as a color-coded badge), and commission earned. Sortable by clicking column headers."
    )

    pdf.subsection_title("2.5 Sales Pipeline Overview")
    pdf.body_text(
        "A grid of all pipeline stages showing the number of leads at each stage and the names "
        "of the first few leads, with an overflow indicator for additional leads."
    )

    pdf.subsection_title("2.6 Activity Feed")
    pdf.body_text(
        "A chronological list of recent activities across all reps, showing call outcomes, "
        "deals closed, and other important events."
    )

    # --- 3. LEADS ---
    pdf.add_page()
    pdf.section_title("3", "Managing Leads")

    pdf.body_text(
        "The Leads page is the central hub for managing all leads in the system. "
        "This is where you import, assign, filter, and oversee all client prospects."
    )

    pdf.subsection_title("3.1 Uploading Leads (CSV Import)")
    pdf.body_text(
        "Click the \"Upload CSV\" button to import leads in bulk. The system accepts:"
    )
    pdf.bullet("File formats: .csv, .xlsx, .xls")
    pdf.bullet("Maximum file size: 10MB")
    pdf.bullet("Columns: business_name, contact_name, phone (required); email, website (optional)")
    pdf.body_text(
        "Uploaded leads are created with \"Uncalled\" status and not assigned to any rep."
    )

    pdf.subsection_title("3.2 Assigning Leads to Reps")
    pdf.body_text(
        "You can assign leads to your sales reps in two ways:"
    )
    pdf.bullet("Bulk Assign: Select multiple leads using checkboxes, click the \"Assign\" button in "
               "the bulk actions toolbar, choose a rep from the dialog, and click \"Assign\"")
    pdf.bullet("Individual: Assign leads one at a time through the lead detail dialog")

    pdf.subsection_title("3.3 Filtering & Searching")
    pdf.body_text("The FilterBar provides powerful search and filter capabilities:")
    pdf.bullet("Search: Type to search by business name, contact name, or phone number")
    pdf.bullet("Status Filter: Multi-select dropdown to filter by one or more pipeline stages")
    pdf.bullet("Saved Filters: Save your current filter configuration for quick reuse")
    pdf.bullet("Active Filter Badges: Show current filters with X buttons to remove individual filters")

    pdf.subsection_title("3.4 Lead Detail View")
    pdf.body_text(
        "Click the three-dot menu on any lead row and select \"View Details\" to open the detail dialog. "
        "From here you can:"
    )
    pdf.bullet("View all lead information (business name, contact, phone, email, website, created date)")
    pdf.bullet("Edit the lead status from the dropdown (all pipeline stages available)")
    pdf.bullet("Update the deal value")
    pdf.bullet("Add or edit notes")

    pdf.subsection_title("3.5 Exporting Leads")
    pdf.bullet("Export All: Click \"Export All\" to download all leads as a CSV file")
    pdf.bullet("Export Selected: Select specific leads and click \"Export\" in the bulk actions toolbar")

    pdf.subsection_title("3.6 Deleting Leads")
    pdf.bullet("Single Delete: Use the three-dot menu and select Delete (with confirmation dialog)")
    pdf.bullet("Bulk Delete: Select multiple leads and click \"Delete\" in the bulk actions toolbar")

    pdf.subsection_title("3.7 View Options")
    pdf.body_text(
        "The leads table supports pagination with rows per page options (25/50/100). "
        "On mobile devices, leads are displayed as cards instead of a table for better readability."
    )

    pdf.tip_box("MANAGER TIP:", "Use saved filters for common views like \"All Uncalled Leads\" or \"Leads with No Answer\".")

    # --- 4. LEADERBOARD ---
    pdf.add_page()
    pdf.section_title("4", "Leaderboard")

    pdf.body_text(
        "The Leaderboard page helps you track and compare your reps' performance. "
        "Use it in team meetings to motivate and recognize top performers."
    )

    pdf.subsection_title("4.1 Sort Options")
    pdf.body_text("Click the sort toggle buttons to rank reps by different metrics:")
    pdf.bullet("Deals - Most deals closed (trophy icon)")
    pdf.bullet("Commission - Highest commission earned ($ icon)")
    pdf.bullet("Success Rate - Best call-to-deal conversion (trending icon)")

    pdf.subsection_title("4.2 Podium (Top 3)")
    pdf.body_text(
        "The top 3 performers appear in a podium layout with animated gradient cards and "
        "gold/silver/bronze borders. Each card shows:"
    )
    pdf.bullet("Rank (with medal emoji)")
    pdf.bullet("Rep name")
    pdf.bullet("Deals closed count")
    pdf.bullet("Commission earned")
    pdf.bullet("Total calls made")
    pdf.bullet("Success rate percentage")

    pdf.subsection_title("4.3 Full Rankings Table")
    pdf.body_text(
        "Below the podium, all reps are listed in a table with: rank number, name, leads, calls, "
        "deals count (green badge), active pipeline count, success rate (with animated progress bar), "
        "and commission."
    )

    pdf.subsection_title("4.4 Chart")
    pdf.body_text(
        "A \"Deals by Rep\" bar chart provides a visual comparison of how many deals each rep has closed."
    )

    # --- 5. ADMIN USERS ---
    pdf.add_page()
    pdf.section_title("5", "Admin Users - Managing Your Team")

    pdf.body_text(
        "The Users page lets you manage all team members who have access to the CRM."
    )

    pdf.subsection_title("5.1 Adding a New User")
    pdf.bullet("Click the \"Add User\" button")
    pdf.bullet("Fill in: Full Name, Email Address, Password (minimum 8 characters)")
    pdf.bullet("Select Role: Sales Rep or Manager")
    pdf.bullet("Click \"Create User\"")
    pdf.body_text(
        "The new user will be able to sign in immediately with their email and password."
    )

    pdf.subsection_title("5.2 User List")
    pdf.body_text(
        "The user list shows all team members (both managers and reps). For each user you can see:"
    )
    pdf.bullet("Name and email address")
    pdf.bullet("Role (Sales Rep or Manager)")
    pdf.bullet("Status badge - Active (green) or Inactive (gray)")

    pdf.subsection_title("5.3 Deactivating a User")
    pdf.body_text(
        "Click the user icon next to any user to toggle their active status. "
        "Deactivated users cannot sign in to the CRM. This is useful when a team member leaves "
        "or is on extended leave."
    )

    pdf.tip_box("NOTE:", "Deactivating a user preserves their data and lead assignments. Reactivate them anytime by clicking again.")

    # --- 6. PIPELINE ---
    pdf.add_page()
    pdf.section_title("6", "Pipeline Overview")

    pdf.body_text(
        "The pipeline overview shows the complete sales funnel across all reps, "
        "giving you visibility into every lead's progress."
    )

    stages = [
        ("Uncalled", "Fresh leads not yet contacted"),
        ("No Answer", "Calls made but no answer"),
        ("Not Interested", "Lead declined"),
        ("Interested", "Lead interested, needs demo"),
        ("Pitching", "Active pitch in progress"),
        ("Demo Scheduled", "Demo booked"),
        ("Demo Completed", "Demo done"),
        ("Negotiation", "Negotiating terms"),
        ("Onboarding", "Client onboarding"),
        ("Deposit Paid", "Deposit received"),
        ("In Progress", "Project active (post-handover)"),
        ("Deal Closed", "Closed won"),
    ]
    for stage, desc in stages:
        pdf.set_font("Segoe", "B", 10)
        pdf.set_text_color(20, 80, 60)
        pdf.cell(40, 6, stage)
        pdf.set_font("Segoe", "", 10)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 6, f" - {desc}")
        pdf.ln(1)

    pdf.ln(2)
    pdf.subsection_title("Commission Model")
    pdf.body_text("Reps earn 20% commission on every deal they close. Commission is calculated automatically.")

    # --- 7. EMAIL SEQUENCES ---
    pdf.add_page()
    pdf.section_title("7", "Email Sequences - Automated Follow-ups")

    pdf.body_text(
        "Email Sequences allow you to create automated email campaigns that trigger based on "
        "lead status changes. This feature helps maintain consistent follow-up with leads "
        "without manual effort."
    )

    pdf.subsection_title("7.1 Creating a New Sequence")
    pdf.bullet("Go to the Email Sequences page from the sidebar")
    pdf.bullet("Click the \"New Sequence\" button")
    pdf.bullet("Enter a Sequence Name (e.g. \"New Lead Welcome\")")
    pdf.bullet("Add a Description explaining the sequence purpose")
    pdf.bullet("Choose the Trigger - when the sequence should start:")
    pdf.bullet("Lead Assigned: Starts when a lead is assigned to a rep", indent=20)
    pdf.bullet("Status Change: Starts when a lead enters a specific stage", indent=20)
    pdf.bullet("Manual: Triggered manually by the rep", indent=20)
    pdf.bullet("If using \"Status Change\", select the trigger stage")
    pdf.bullet("Click \"Save Sequence\" to create it")

    pdf.subsection_title("7.2 Building Sequence Steps")
    pdf.body_text(
        "After creating a sequence, add steps using the Sequence Builder:"
    )
    pdf.bullet_bold_lead("Send Email", " Compose an email with subject and body. "
        "The email will be sent to the lead's email address automatically.")
    pdf.bullet_bold_lead("Delay", " Wait a specified number of days before the next step "
        "(e.g. wait 3 days after the initial email).")
    pdf.bullet_bold_lead("Update Stage", " Automatically advance the lead to a new pipeline stage "
        "after this step completes.")
    pdf.bullet_bold_lead("Notify", " Send a notification to a manager or the assigned rep.")
    pdf.bullet_bold_lead("Condition", " Branch based on lead data (e.g. only send if lead is interested).")
    pdf.body_text(
        "Steps execute in order. Use the delay step strategically to space out communications. "
        "You can reorder steps by editing step numbers in the builder."
    )

    pdf.subsection_title("7.3 Viewing Email Logs")
    pdf.body_text(
        "The Logs tab shows all emails sent by the system, including:"
    )
    pdf.bullet("Recipient email address")
    pdf.bullet("Email subject line")
    pdf.bullet("Sent date and time")
    pdf.bullet("Delivery status (sent/failed)")
    pdf.bullet("Open and click tracking (if available)")
    pdf.body_text(
        "Use the sequence filter to view logs for a specific sequence, or view all logs together."
    )

    pdf.subsection_title("7.4 Managing Sequences")
    pdf.body_text(
        "From the Email Sequences page, you can:"
    )
    pdf.bullet("View all sequences in a list with their name, description, and active status")
    pdf.bullet("Click a sequence to open its detail view with step builder and logs")
    pdf.bullet("Toggle a sequence on/off using the active switch")
    pdf.bullet("Delete sequences that are no longer needed")
    pdf.body_text(
        "Only active sequences will execute their steps when triggered. "
        "Inactive sequences remain saved but do not send emails."
    )

    pdf.tip_box("TIP:", "Start with a simple welcome sequence: Send email -> Wait 3 days -> Send follow-up -> Wait 5 days -> Send final offer.")

    # --- 8. SETTINGS ---
    pdf.add_page()
    pdf.section_title("8", "Settings - Managing Your Account")

    pdf.body_text(
        "The Settings page displays your profile and lets you change your password."
    )

    pdf.subsection_title("7.1 Your Profile")
    pdf.body_text("Shows your name, email address, and role (Manager). This is read-only.")

    pdf.subsection_title("7.2 Changing Your Password")
    pdf.bullet("Enter current password")
    pdf.bullet("Enter new password (min 8 chars, must include uppercase, lowercase, and digit)")
    pdf.bullet("Confirm new password")
    pdf.bullet("Click \"Change Password\"")

    # --- 9. NOTIFICATIONS ---
    pdf.add_page()
    pdf.section_title("9", "Notifications")

    pdf.body_text(
        "Managers receive notifications for key events across the entire agency. "
        "The bell icon in the top bar shows your unread count."
    )
    pdf.bullet("Click the bell to view notifications")
    pdf.bullet("\"Mark all read\" clears all unread notifications")
    pdf.bullet("Notifications poll automatically every 30 seconds")
    pdf.body_text("You receive notifications for:")
    pdf.bullet("Leads assigned to reps")
    pdf.bullet("Demo requests created, scheduled, or completed")
    pdf.bullet("Handovers created or completed")
    pdf.bullet("Deals closed by any rep")

    # --- 10. TECHNICAL REFERENCE ---
    pdf.add_page()
    pdf.section_title("10", "Technical Reference")

    pdf.subsection_title("9.1 System Architecture")
    pdf.body_text("The CRM consists of two main components:")
    pdf.bullet("Backend: FastAPI (Python) hosted on PythonAnywhere")
    pdf.bullet("Frontend: React (TypeScript) hosted on Cloudflare Pages")
    pdf.bullet("Database: PostgreSQL (or SQLite for local development)")

    pdf.subsection_title("9.2 Deployment")
    pdf.body_text("The system uses GitHub Actions for CI/CD:")
    pdf.bullet("Backend: Git push to PythonAnywhere, then run the reload script")
    pdf.bullet("Frontend: Automatic deployment via Cloudflare Pages on push to main")
    pdf.bullet("CI/CD pipeline: Tests run automatically before deployment")

    pdf.subsection_title("9.3 Backend Management (PythonAnywhere)")
    pdf.bullet("Access: PythonAnywhere dashboard with your account credentials")
    pdf.bullet("Code: Clone/pull from GitHub repository")
    pdf.bullet("Environment variables: Configure in the PythonAnywhere web tab")
    pdf.bullet("Restart: Use the reload button or the deployment script")
    pdf.bullet("Database: Managed via SQLite file or external PostgreSQL connection")

    pdf.subsection_title("9.4 Environment Variables")
    pdf.body_text("The backend requires these environment variables:")
    pdf.bullet("DATABASE_URL - Database connection string")
    pdf.bullet("JWT_SECRET - Secret key for JWT token generation")
    pdf.bullet("CORS_ORIGINS - Comma-separated list of allowed frontend origins")
    pdf.bullet("JWT_EXPIRATION_HOURS - Token expiry time (default: 24)")

    pdf.subsection_title("9.5 Adding New Reps")
    pdf.body_text(
        "To add a new sales rep to the system:"
    )
    pdf.bullet("Navigate to the Users page (sidebar -> Users)")
    pdf.bullet("Click \"Add User\" and fill in their details with role = Sales Rep")
    pdf.bullet("Provide them with the CRM URL and their credentials")
    pdf.bullet("Assign leads to them from the Leads page")

    pdf.subsection_title("9.6 Adding New Managers")
    pdf.body_text(
        "To add another manager or admin: Follow the same process as adding a user, "
        "but select the \"Manager\" role."
    )

    pdf.subsection_title("9.7 Password Policy")
    pdf.body_text("User passwords must:")
    pdf.bullet("Be at least 8 characters long")
    pdf.bullet("Contain at least one uppercase letter")
    pdf.bullet("Contain at least one lowercase letter")
    pdf.bullet("Contain at least one digit")

    pdf.subsection_title("9.8 Security Notes")
    pdf.bullet("JWT tokens expire after 24 hours (users must log back in)")
    pdf.bullet("Rate limiting: 10 requests per 60 seconds per IP")
    pdf.bullet("Security headers: CSP, HSTS, X-Frame-Options are enforced")
    pdf.bullet("Passwords are hashed using bcrypt")
    pdf.bullet("Always use HTTPS in production")

    pdf.subsection_title("9.9 Troubleshooting")
    pdf.bullet("User can't log in? Check if their account is active (Users page)")
    pdf.bullet("Leads not showing up? Check filters and pagination")
    pdf.bullet("Upload failing? Check file format (.csv/.xlsx/.xls) and size limit (10MB)")
    pdf.bullet("API errors? Check the backend logs on PythonAnywhere")
    pdf.bullet("Frontend issues? Check the browser console for errors")

    pdf.ln(4)
    pdf.tip_box("SUPPORT:", "For technical issues, contact the system administrator or developer.")


# --- GENERATE BOTH PDFs ---

def make_pdf(build_fn, filename, title):
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_font("Segoe", "", FONT_REGULAR)
    pdf.add_font("Segoe", "B", FONT_BOLD)
    pdf.add_font("Segoe", "I", FONT_ITALIC)
    pdf.add_font("Segoe", "BI", FONT_BI)
    pdf.set_auto_page_break(auto=True, margin=20)
    build_fn(pdf)
    output_path = OUTPUT_DIR / filename
    pdf.output(str(output_path))
    return output_path


print("Generating Sales Rep Guide...")
path1 = make_pdf(build_sales_guide, "Sales_Rep_Guide.pdf", "Sales Rep Guide")
print(f"  -> {path1}")

print("Generating Admin Guide...")
path2 = make_pdf(build_admin_guide, "Admin_Guide.pdf", "Admin Guide")
print(f"  -> {path2}")

print("\nDone! Both PDFs generated successfully.")
