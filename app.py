import streamlit as st
import plotly.graph_objects as go
import numpy as np
import pandas as pd

# ==========================================
# PAGE CONFIGURATION
# ==========================================
st.set_page_config(layout="wide", page_title="Children's Academy PISA 2025", page_icon="🎓")

# ==========================================
# GLOBAL DATASETS (Thakur, Malad, Ashok Nagar)
# ==========================================
branches = ['Thakur Complex', 'Malad', 'Ashok Nagar']

# 1. Demographics & Context
demo_data = {
    'Students': [108, 125, 114],
    'Boys (%)': [48.1, 58.4, 56.1],
    'Girls (%)': [51.9, 41.6, 43.9],
    'ESCS (Socio-Economic Index)': [0.45, 0.25, 0.50]
}

# 2. Cognitive Averages
cog_data = {
    'Thakur Complex': [516, 500, 497],
    'Malad': [467, 474, 476],
    'Ashok Nagar': [472, 508, 499],
    'Singapore': [543, 575, 561],
    'OECD': [476, 472, 485]
}

# 3. Proficiency & Gender 
prof_data = {
    'Reading': {'Low': [7, 23, 22], 'Med': [83, 75, 75], 'High': [10, 3, 3]},
    'Mathematics': {'Low': [21, 28, 16], 'Med': [66, 65, 71], 'High': [13, 7, 13]},
    'Science': {'Low': [15, 22, 14], 'Med': [80, 75, 79], 'High': [5, 3, 6]}
}

gender_data = {
    'Reading': {'Girls': [515, 480, 479], 'Boys': [518, 458, 466]},
    'Mathematics': {'Girls': [494, 453, 500], 'Boys': [507, 489, 514]},
    'Science': {'Girls': [493, 474, 492], 'Boys': [501, 477, 507]}
}

# 4. Student Voice
voice_categories = ['Belonging', 'Disciplinary Climate', 'Feeling Safe', 'Teacher Relation', 'Growth Mindset']
voice_data = {
    'Thakur Complex': [0.18, 0.13, 0.49, 0.28, 0.37],
    'Malad': [0.30, -0.04, 0.36, 0.12, 0.14],
    'Ashok Nagar': [0.33, 0.36, 0.64, 0.51, 0.42],
    'OECD': [-0.02, 0.02, 0.00, 0.00, 0.02]
}

# Cohesive Premium Color Palette
COLOR_MAP = {
    'Thakur Complex': '#6366F1',  # Indigo
    'Malad': '#14B8A6',          # Teal
    'Ashok Nagar': '#8B5CF6',      # Violet
    'OECD Average': '#9CA3AF',    # Muted Gray
    'OECD Avg': '#9CA3AF',
    'OECD': '#9CA3AF',
    'Singapore': '#F43F5E',       # Coral Red
    'Girls': '#EC4899',           # Pink
    'Boys': '#3B82F6',            # Blue
    'CAGS Network': '#4F46E5',    # Deep Indigo
    'Below Level 2': '#EF4444',   # Red
    'Levels 2-4': '#94A3B8',      # Muted slate/gray
    'Levels 5-6': '#3B82F6',      # Blue
}

# ==========================================
# CUSTOM STYLING INJECTION (CSS)
# ==========================================
def inject_custom_css():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    html, body, [class*="css"], .stApp {
        font-family: 'Inter', sans-serif;
    }
    
    /* Header styling */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Inter', sans-serif;
        font-weight: 700 !important;
        letter-spacing: -0.02em;
    }
    
    /* Custom Card */
    .custom-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(128, 128, 128, 0.12);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.01);
    }
    
    /* Domain Cards (Page 1) */
    .domain-card {
        padding: 24px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(128, 128, 128, 0.12);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        transition: transform 0.2s ease, border-color 0.2s ease;
        margin-bottom: 20px;
    }
    .domain-card:hover {
        transform: translateY(-2px);
        border-color: rgba(99, 102, 241, 0.3);
    }
    .domain-icon {
        font-size: 2.2rem;
        margin-bottom: 12px;
    }
    .domain-title {
        font-weight: 600;
        font-size: 1.15rem;
        margin-bottom: 8px;
    }
    .domain-desc {
        font-size: 0.9rem;
        line-height: 1.5;
        color: #4B5563;
    }
    
    /* Premium KPI Card Styling */
    [data-testid="stMetric"] {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(128, 128, 128, 0.15);
        padding: 18px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }
    
    [data-testid="stMetric"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 20px rgba(99, 102, 241, 0.06);
        border-color: rgba(99, 102, 241, 0.35);
    }
    
    [data-testid="stMetricLabel"] {
        font-size: 0.9rem !important;
        font-weight: 600 !important;
        color: #4B5563 !important;
    }
    
    [data-testid="stMetricValue"] {
        font-size: 1.8rem !important;
        font-weight: 700 !important;
        margin-top: 4px;
    }

    /* Dark mode override */
    @media (prefers-color-scheme: dark) {
        [data-testid="stMetricLabel"] {
            color: #D1D5DB !important;
        }
        [data-testid="stMetric"] {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .domain-card {
            background: rgba(255, 255, 255, 0.01);
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .domain-desc {
            color: #9CA3AF;
        }
        .custom-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
    }
    
    </style>
    """, unsafe_allow_html=True)

# Run CSS Injection
inject_custom_css()

# ==========================================
# DYNAMIC NARRATIVE INSIGHTS GENERATOR
# ==========================================
def generate_individual_insights(branch, idx):
    scores = cog_data[branch]
    oecd = cog_data['OECD']
    
    # Demographics
    escs = demo_data['ESCS (Socio-Economic Index)'][idx]
    escs_desc = "above" if escs > 0 else "below"
    
    # Cognitive differences
    subjects = ['Reading', 'Mathematics', 'Science']
    diffs = [scores[i] - oecd[i] for i in range(3)]
    
    # Find strengths & gaps
    highest_sub_idx = np.argmax(scores)
    highest_sub = subjects[highest_sub_idx]
    highest_score = scores[highest_sub_idx]
    highest_diff = diffs[highest_sub_idx]
    
    # Student Voice
    v_vals = voice_data[branch]
    highest_voice_idx = np.argmax(v_vals)
    highest_voice = voice_categories[highest_voice_idx]
    highest_voice_val = v_vals[highest_voice_idx]
    
    lowest_voice_idx = np.argmin(v_vals)
    lowest_voice = voice_categories[lowest_voice_idx]
    lowest_voice_val = v_vals[lowest_voice_idx]
    
    insights = []
    insights.append(f"🎓 **Academic Summary:** **{branch}**'s strongest subject is **{highest_sub}** with an average score of **{highest_score}** (which is **{highest_diff:+} points** relative to the OECD average).")
    
    for i, sub in enumerate(subjects):
        d = diffs[i]
        years = abs(d) / 30.0  # 30-40 points is roughly 1 year
        comp_word = "ahead of" if d > 0 else "behind"
        insights.append(f"  * **{sub}**: Score **{scores[i]}** ({d:+} vs OECD). This is equivalent to being approximately **{years:.1f} school year(s)** {comp_word} the OECD baseline.")
        
    insights.append(f"🏫 **School Climate & Voice:**")
    insights.append(f"  * **Key Strength**: Students report high positive scores in **{highest_voice}** ({highest_voice_val:+.2f} standard deviations above the OECD baseline).")
    if lowest_voice_val < 0.1:
        insights.append(f"  * **Opportunity for Growth**: **{lowest_voice}** is the lowest relative area ({lowest_voice_val:+.2f} standard deviations relative to the OECD baseline), suggesting a focus area for school leadership.")
    
    insights.append(f"👥 **Socio-Economic Context:** The socio-economic status index (ESCS) is **{escs:+.2f}**, which is **{escs_desc}** the OECD average of 0.00. This indicates that the school community has a {'favorable' if escs > 0 else 'challenging'} demographic baseline.")
    
    return insights

# ==========================================
# SIDEBAR NAVIGATION & DATA EXPORT
# ==========================================
st.sidebar.title("Navigation")
page = st.sidebar.radio("Select a view:", [
    "1. Context: PISA & OECD", 
    "2. Individual School Reports", 
    "3. Comparative School Reports", 
    "4. Combined CAGS vs OECD (PR)"
])

st.sidebar.markdown("---")
st.sidebar.info("**Assessment Window:** Sept - Nov 2025\n\n**Administered By:** ExcelOne & ETS\n\n**Total Network Sample:** 347 Students")

# Data Export Utility
st.sidebar.markdown("---")
st.sidebar.markdown("### 📥 Export Dashboard Data")
export_choice = st.sidebar.selectbox("Choose dataset to export:", ["Cognitive Performance", "Student Voice & Culture", "Demographics"], help="Choose the data table to download.")

if export_choice == "Cognitive Performance":
    df_export = pd.DataFrame(cog_data).T
    df_export.index.name = "Entity"
    df_export.columns = ["Reading", "Mathematics", "Science"]
elif export_choice == "Student Voice & Culture":
    df_export = pd.DataFrame(voice_data).T
    df_export.index.name = "Entity"
    df_export.columns = voice_categories
else:
    df_export = pd.DataFrame(demo_data, index=branches)
    df_export.index.name = "Branch"

csv_data = df_export.to_csv().encode('utf-8')
st.sidebar.download_button(
    label=f"Download {export_choice} (CSV)",
    data=csv_data,
    file_name=f"pisa_2025_{export_choice.lower().replace(' ', '_')}.csv",
    mime="text/csv",
    help="Download the selected table as a CSV file for offline analysis."
)

st.sidebar.markdown("""
<div style="font-size: 0.8rem; color: gray; margin-top: 30px; border-top: 1px solid rgba(128,128,128,0.2); padding-top: 15px;">
    <strong>Children's Academy Network</strong><br>
    PISA 2025 Dashboard v1.1<br>
    <em>ExcelOne & ETS Joint Administration</em>
</div>
""", unsafe_allow_html=True)


# ==========================================
# PAGE 1: CONTEXT (PISA & OECD)
# ==========================================
if page == "1. Context: PISA & OECD":
    st.title("📚 Context: Understanding PISA & OECD")
    st.markdown("Before diving into the data, it is crucial to understand the rigorous global benchmarks being used to evaluate the Children's Academy network.")
    
    colA, colB = st.columns(2)
    with colA:
        st.header("What is PISA for Schools?")
        st.write("""
        The **Programme for International Student Assessment (PISA)** is a gold-standard global assessment created by the OECD. 
        Rather than testing raw memory or curriculum content, PISA assesses how well 15-year-old students can apply their knowledge 
        to real-world scenarios in **Reading, Mathematics, and Science**. 
        
        It also measures crucial non-cognitive skills—student well-being, growth mindset, sense of belonging, and school climate—providing 
        a holistic picture of school health.
        """)
    
    with colB:
        st.header("What is the OECD Average?")
        st.write("""
        The OECD (Organisation for Economic Co-operation and Development) average serves as the global baseline. It represents the combined 
        average of highly developed, top-performing education systems around the world. Scoring "similar to" or "higher than" the OECD average 
        means a school is operating at elite global standards.
        """)
    
    st.markdown("---")
    st.subheader("What does PISA Assess?")
    st.markdown("PISA evaluates student literacy in three core domains. These are not simple subjects, but critical life-readiness dimensions:")
    
    col_d1, col_d2, col_d3 = st.columns(3)
    with col_d1:
        st.markdown("""
        <div class="domain-card" style="border-left-color: #6366F1;">
            <div class="domain-icon">📖</div>
            <div class="domain-title" style="color: #6366F1;">Reading Literacy</div>
            <div class="domain-desc">
                The capacity to understand, use, evaluate, reflect on, and engage with texts in order to achieve goals, develop knowledge and potential, and participate effectively in society.
            </div>
        </div>
        """, unsafe_allow_html=True)
    with col_d2:
        st.markdown("""
        <div class="domain-card" style="border-left-color: #14B8A6;">
            <div class="domain-icon">🧮</div>
            <div class="domain-title" style="color: #14B8A6;">Mathematical Literacy</div>
            <div class="domain-desc">
                The capacity to formulate, employ, and interpret mathematics in a variety of contexts to describe, explain, and predict phenomena.
            </div>
        </div>
        """, unsafe_allow_html=True)
    with col_d3:
        st.markdown("""
        <div class="domain-card" style="border-left-color: #8B5CF6;">
            <div class="domain-icon">🔬</div>
            <div class="domain-title" style="color: #8B5CF6;">Scientific Literacy</div>
            <div class="domain-desc">
                The ability to engage with science-related issues, and with the ideas of science, as a reflective citizen. Requires explaining phenomena scientifically.
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.subheader("Which Countries Make up the OECD?")
    st.markdown("The 38 member countries represent a vast majority of the world's wealth and educational advancement. Explored below by region:")
    
    tab1, tab2, tab3 = st.tabs(["🇪🇺 Europe & Middle East (26)", "🌏 Asia-Pacific (4)", "🇺🇸 Americas (8)"])
    with tab1:
        st.markdown("""
        *   **Western & Central Europe:** United Kingdom, Germany, France, Italy, Spain, Netherlands, Belgium, Switzerland, Austria, Ireland, Luxembourg
        *   **Northern Europe:** Finland, Sweden, Norway, Denmark, Iceland, Estonia, Latvia, Lithuania
        *   **Eastern & Southern Europe:** Poland, Czech Republic, Slovak Republic, Hungary, Slovenia, Portugal, Greece, Türkiye
        *   **Middle East:** Israel
        """)
    with tab2:
        st.markdown("""
        *   **East Asia:** Japan, South Korea
        *   **Oceania:** Australia, New Zealand
        """)
    with tab3:
        st.markdown("""
        *   **North America:** United States, Canada, Mexico
        *   **South & Central America:** Chile, Colombia, Costa Rica
        """)

# ==========================================
# PAGE 2: INDIVIDUAL SCHOOL REPORTS
# ==========================================
elif page == "2. Individual School Reports":
    st.title("🏫 Individual School Reports")
    st.markdown("Select a branch below to view its specific demographic context and performance metrics against global benchmarks.")
    
    selected_branch = st.selectbox("Select Branch:", branches, help="Choose the school branch to inspect.")
    idx = branches.index(selected_branch)
    
    # Demographics
    st.subheader(f"Snapshot: {selected_branch}")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric(
        "Students Tested", 
        demo_data['Students'][idx],
        help="Total number of 15-year-old students who sat for the PISA 2025 assessment in this branch."
    )
    c2.metric(
        "Boys", 
        f"{demo_data['Boys (%)'][idx]}%",
        help="Percentage of male students in the school's sample."
    )
    c3.metric(
        "Girls", 
        f"{demo_data['Girls (%)'][idx]}%",
        help="Percentage of female students in the school's sample."
    )
    c4.metric(
        "Socio-Economic Index (ESCS)", 
        f"{demo_data['ESCS (Socio-Economic Index)'][idx]:+.2f}",
        help="PISA Index of Economic, Social and Cultural Status. Higher scores mean greater socioeconomic resources at home. OECD average is 0.00."
    )
    
    st.markdown("---")
    
    colA, colB = st.columns(2)
    with colA:
        # Cognitive Chart 
        st.markdown("#### Cognitive Performance")
        subjects = ['Reading', 'Mathematics', 'Science']
        branch_scores = cog_data[selected_branch]
        oecd_scores = cog_data['OECD']
        
        # Interactive Option
        show_sg = st.checkbox("Compare with Singapore (Global Leader 🇸🇬)", value=False, help="Toggle to display Singapore's world-leading scores.")
        
        fig_data = [
            go.Bar(
                name=selected_branch, 
                x=subjects, 
                y=branch_scores, 
                marker_color=COLOR_MAP[selected_branch], 
                text=branch_scores, 
                textposition='outside'
            ),
            go.Bar(
                name='OECD Average', 
                x=subjects, 
                y=oecd_scores, 
                marker_color=COLOR_MAP['OECD'], 
                text=oecd_scores, 
                textposition='outside'
            )
        ]
        if show_sg:
            fig_data.append(go.Bar(
                name='Singapore 🇸🇬', 
                x=subjects, 
                y=cog_data['Singapore'], 
                marker_color=COLOR_MAP['Singapore'], 
                text=cog_data['Singapore'], 
                textposition='outside'
            ))
            
        fig_ind = go.Figure(data=fig_data)
        fig_ind.update_layout(
            barmode='group', 
            yaxis_title='PISA Score', 
            yaxis_range=[300, 600], 
            margin=dict(t=20, b=20, l=20, r=20), 
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        fig_ind.update_xaxes(showline=False, showgrid=False, zeroline=False)
        fig_ind.update_yaxes(showline=False, showgrid=True, gridcolor='rgba(229, 231, 235, 0.4)', zeroline=False)
        
        st.plotly_chart(fig_ind, use_container_width=True)

    with colB:
        # Voice Chart
        st.markdown("#### Student Voice & Culture (0 = OECD Avg)")
        
        # Interactive Option
        voice_view = st.radio(
            "Student Voice View:", 
            ["Bar Chart (Recommended) 📊", "Radar Chart 🕸️"], 
            horizontal=True,
            help="Switch between a grouped horizontal bar chart and a radar chart for comparing school climate."
        )
        
        if voice_view == "Bar Chart (Recommended) 📊":
            vals = voice_data[selected_branch]
            oecd_vals = voice_data['OECD']
            
            fig_v = go.Figure(data=[
                go.Bar(
                    name=selected_branch, 
                    y=voice_categories, 
                    x=vals, 
                    orientation='h', 
                    marker_color=COLOR_MAP[selected_branch], 
                    text=[f"{v:+.2f}" for v in vals], 
                    textposition='outside'
                ),
                go.Bar(
                    name='OECD Average', 
                    y=voice_categories, 
                    x=oecd_vals, 
                    orientation='h', 
                    marker_color=COLOR_MAP['OECD'], 
                    text=[f"{v:+.2f}" for v in oecd_vals], 
                    textposition='outside'
                )
            ])
            fig_v.update_layout(
                barmode='group',
                xaxis_title='PISA Index Score (Standard Deviations relative to OECD)',
                xaxis_range=[-0.3, 0.7],
                margin=dict(t=20, b=20, l=20, r=20),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
            )
            fig_v.update_xaxes(showline=False, showgrid=True, gridcolor='rgba(229, 231, 235, 0.4)', zeroline=True, zerolinecolor='rgba(0,0,0,0.2)')
            fig_v.update_yaxes(showline=False, showgrid=False, zeroline=False)
            
            st.plotly_chart(fig_v, use_container_width=True)
            
        else:
            fig_r = go.Figure()
            vals = voice_data[selected_branch] + [voice_data[selected_branch][0]]
            cats = voice_categories + [voice_categories[0]]
            oecd_vals = voice_data['OECD'] + [voice_data['OECD'][0]]
            
            fig_r.add_trace(go.Scatterpolar(
                r=vals,
                theta=cats,
                fill='toself',
                name=selected_branch,
                line_color=COLOR_MAP[selected_branch],
                fillcolor=f"rgba({int(COLOR_MAP[selected_branch][1:3], 16)}, {int(COLOR_MAP[selected_branch][3:5], 16)}, {int(COLOR_MAP[selected_branch][5:7], 16)}, 0.15)"
            ))
            fig_r.add_trace(go.Scatterpolar(
                r=oecd_vals,
                theta=cats,
                fill='toself',
                name='OECD Average',
                line_color=COLOR_MAP['OECD'],
                fillcolor='rgba(156, 163, 175, 0.08)'
            ))

            fig_r.update_layout(
                polar=dict(
                    radialaxis=dict(visible=True, range=[-0.2, 0.7], gridcolor='rgba(229, 231, 235, 0.4)'),
                    angularaxis=dict(gridcolor='rgba(229, 231, 235, 0.4)')
                ),
                showlegend=True,
                margin=dict(t=20, b=20, l=20, r=20),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
            )
            st.plotly_chart(fig_r, use_container_width=True)

    # Narrative Insights
    st.markdown("---")
    st.subheader("💡 Key Insights & Takeaways")
    insights = generate_individual_insights(selected_branch, idx)
    
    # Render inside a neat card
    insights_html = "<div class='custom-card'>"
    for ins in insights:
        cleaned_ins = ins.replace("**", "<strong>").replace("**", "</strong>")
        if cleaned_ins.startswith("💡") or cleaned_ins.startswith("🏫") or cleaned_ins.startswith("👥") or cleaned_ins.startswith("🎓"):
            insights_html += f"<div style='margin-top: 12px; margin-bottom: 6px; font-weight: 500;'>{cleaned_ins}</div>"
        else:
            insights_html += f"<div style='margin-left: 20px; font-size: 0.92rem; margin-bottom: 4px;'>{cleaned_ins}</div>"
    insights_html += "</div>"
    st.markdown(insights_html, unsafe_allow_html=True)

# ==========================================
# PAGE 3: COMPARATIVE REPORTS
# ==========================================
elif page == "3. Comparative School Reports":
    st.title("📊 Comparative School Reports")
    st.markdown("Benchmarking the Thakur Complex, Malad, and Ashok Nagar branches against one another to spot internal trends.")
    
    # Cognitive Performance
    st.subheader("1. Average Subject Performance by Branch")
    subjects = ['Reading', 'Mathematics', 'Science']

    fig_comp1 = go.Figure(data=[
        go.Bar(
            name='Thakur Complex', 
            x=subjects, 
            y=[cog_data['Thakur Complex'][i] for i in range(3)], 
            marker_color=COLOR_MAP['Thakur Complex'],
            text=[cog_data['Thakur Complex'][i] for i in range(3)],
            textposition='outside'
        ),
        go.Bar(
            name='Malad', 
            x=subjects, 
            y=[cog_data['Malad'][i] for i in range(3)], 
            marker_color=COLOR_MAP['Malad'],
            text=[cog_data['Malad'][i] for i in range(3)],
            textposition='outside'
        ),
        go.Bar(
            name='Ashok Nagar', 
            x=subjects, 
            y=[cog_data['Ashok Nagar'][i] for i in range(3)], 
            marker_color=COLOR_MAP['Ashok Nagar'],
            text=[cog_data['Ashok Nagar'][i] for i in range(3)],
            textposition='outside'
        ),
        go.Bar(
            name='OECD Average', 
            x=subjects, 
            y=[cog_data['OECD'][i] for i in range(3)], 
            marker_color=COLOR_MAP['OECD'],
            text=[cog_data['OECD'][i] for i in range(3)],
            textposition='outside'
        )
    ])
    fig_comp1.update_layout(
        barmode='group', 
        yaxis_title='PISA Score', 
        yaxis_range=[350, 600], 
        margin=dict(t=20, b=20, l=20, r=20), 
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)'
    )
    fig_comp1.update_xaxes(showline=False, showgrid=False, zeroline=False)
    fig_comp1.update_yaxes(showline=False, showgrid=True, gridcolor='rgba(229, 231, 235, 0.4)', zeroline=False)
    
    st.plotly_chart(fig_comp1, use_container_width=True)
    
    # Proficiency and Gender Gaps
    st.markdown("---")
    st.subheader("2. Subject Deep Dives (Proficiency & Equity)")
    subject = st.selectbox("Select Subject:", ['Reading', 'Mathematics', 'Science'], help="Choose the subject to inspect school proficiency bands and gender equity.")
    
    colA, colB = st.columns(2)
    with colA:
        low = prof_data[subject]['Low']
        med = prof_data[subject]['Med']
        high = prof_data[subject]['High']
        
        fig_prof = go.Figure(data=[
            go.Bar(
                name='Below Level 2 (Low Performers)', 
                x=branches, 
                y=low, 
                marker_color=COLOR_MAP['Below Level 2'], 
                text=[f"{val}%" for val in low], 
                textposition='inside'
            ),
            go.Bar(
                name='Levels 2-4 (Baseline/Core)', 
                x=branches, 
                y=med, 
                marker_color=COLOR_MAP['Levels 2-4'], 
                text=[f"{val}%" for val in med], 
                textposition='inside'
            ),
            go.Bar(
                name='Levels 5-6 (Top Performers)', 
                x=branches, 
                y=high, 
                marker_color=COLOR_MAP['Levels 5-6'], 
                text=[f"{val}%" for val in high], 
                textposition='inside'
            )
        ])
        fig_prof.update_layout(
            barmode='stack', 
            title=f'{subject} Proficiency Level Distribution', 
            yaxis_title='Percentage of Students (%)',
            yaxis_range=[0, 100],
            margin=dict(t=40, b=20, l=20, r=20), 
            legend=dict(orientation="h", yanchor="top", y=-0.15, xanchor="center", x=0.5),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        fig_prof.update_xaxes(showline=False, showgrid=False, zeroline=False)
        fig_prof.update_yaxes(showline=False, showgrid=True, gridcolor='rgba(229, 231, 235, 0.4)', zeroline=False)
        
        st.plotly_chart(fig_prof, use_container_width=True)
        
    with colB:
        girls = gender_data[subject]['Girls']
        boys = gender_data[subject]['Boys']
        
        fig_gen = go.Figure()

        for i, branch in enumerate(branches):
            fig_gen.add_trace(go.Scatter(
                x=[girls[i], boys[i]], 
                y=[branch, branch], 
                mode='lines', 
                line=dict(color='#D1D5DB', width=3), 
                showlegend=False
            ))
            
            # Text annotation for gap
            gap = abs(boys[i] - girls[i])
            favored = "Girls" if girls[i] > boys[i] else "Boys"
            fig_gen.add_annotation(
                x=(girls[i] + boys[i])/2, 
                y=branch, 
                text=f"Gap: {gap} pts ({favored} ahead)", 
                showarrow=False, 
                yshift=15,
                font=dict(family="Inter", size=10, weight="bold")
            )

        fig_gen.add_trace(go.Scatter(
            x=girls, 
            y=branches, 
            mode='markers', 
            name='Girls', 
            marker=dict(color=COLOR_MAP['Girls'], size=14, symbol='circle', line=dict(color='white', width=2))
        ))
        fig_gen.add_trace(go.Scatter(
            x=boys, 
            y=branches, 
            mode='markers', 
            name='Boys', 
            marker=dict(color=COLOR_MAP['Boys'], size=14, symbol='circle', line=dict(color='white', width=2))
        ))

        fig_gen.update_layout(
            title=f'Gender Performance Gap in {subject}', 
            xaxis_title="PISA Score", 
            yaxis_autorange="reversed", 
            margin=dict(t=40, b=20, l=20, r=20), 
            legend=dict(orientation="h", yanchor="top", y=-0.15, xanchor="center", x=0.5),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        fig_gen.update_xaxes(showline=False, showgrid=True, gridcolor='rgba(229, 231, 235, 0.4)', zeroline=False)
        fig_gen.update_yaxes(showline=False, showgrid=False, zeroline=False)
        
        st.plotly_chart(fig_gen, use_container_width=True)
        
    # Radar/Bar Chart for Voice
    st.markdown("---")
    st.subheader("3. Student Voice & Culture Comparison")
    
    comp_voice_view = st.radio(
        "Comparison View:", 
        ["Bar Chart (Recommended) 📊", "Radar Chart 🕸️"], 
        horizontal=True, 
        key="comp_voice_view", 
        help="Select chart type to compare non-cognitive dimensions across schools."
    )

    if comp_voice_view == "Bar Chart (Recommended) 📊":
        fig_v_comp = go.Figure(data=[
            go.Bar(name='Thakur Complex', y=voice_categories, x=voice_data['Thakur Complex'], orientation='h', marker_color=COLOR_MAP['Thakur Complex']),
            go.Bar(name='Malad', y=voice_categories, x=voice_data['Malad'], orientation='h', marker_color=COLOR_MAP['Malad']),
            go.Bar(name='Ashok Nagar', y=voice_categories, x=voice_data['Ashok Nagar'], orientation='h', marker_color=COLOR_MAP['Ashok Nagar']),
            go.Bar(name='OECD Average', y=voice_categories, x=voice_data['OECD'], orientation='h', marker_color=COLOR_MAP['OECD'])
        ])
        fig_v_comp.update_layout(
            barmode='group',
            xaxis_title='PISA Index Score (Standard Deviations relative to OECD)',
            xaxis_range=[-0.3, 0.7],
            margin=dict(t=20, b=20, l=20, r=20),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        fig_v_comp.update_xaxes(showline=False, showgrid=True, gridcolor='rgba(229, 231, 235, 0.4)', zeroline=True, zerolinecolor='rgba(0,0,0,0.2)')
        fig_v_comp.update_yaxes(showline=False, showgrid=False, zeroline=False)
        
        st.plotly_chart(fig_v_comp, use_container_width=True)
        
    else:
        fig_radar = go.Figure()
        cats = voice_categories + [voice_categories[0]]

        def add_to_radar(fig, values, label, color):
            vals = values + [values[0]]
            fig.add_trace(go.Scatterpolar(
                r=vals,
                theta=cats,
                fill='toself',
                name=label,
                line_color=color,
                fillcolor='rgba(0,0,0,0.02)'
            ))

        add_to_radar(fig_radar, voice_data['Thakur Complex'], 'Thakur Complex', COLOR_MAP['Thakur Complex'])
        add_to_radar(fig_radar, voice_data['Malad'], 'Malad', COLOR_MAP['Malad'])
        add_to_radar(fig_radar, voice_data['Ashok Nagar'], 'Ashok Nagar', COLOR_MAP['Ashok Nagar'])
        add_to_radar(fig_radar, voice_data['OECD'], 'OECD Average', COLOR_MAP['OECD'])

        fig_radar.update_layout(
            polar=dict(
                radialaxis=dict(visible=True, range=[-0.2, 0.7], gridcolor='rgba(229, 231, 235, 0.4)'),
                angularaxis=dict(gridcolor='rgba(229, 231, 235, 0.4)')
            ),
            showlegend=True,
            margin=dict(t=20, b=20, l=20, r=20),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_radar, use_container_width=True)

# ==========================================
# PAGE 4: COMBINED CAGS VS OECD (PR SHOWCASE)
# ==========================================
elif page == "4. Combined CAGS vs OECD (PR)":
    st.title("🏆 The Global Benchmark: CAGS vs. OECD")
    st.markdown("By consolidating data across all 347 students, the Children's Academy network vividly demonstrates that our educational standards and student well-being **dramatically outperform international baseline averages.**")
    
    # Consolidated Data
    cags_cog = [484, 493, 490]  # Reading, Math, Sci
    oecd_cog = [476, 472, 485]
    
    cags_voice_pr = [0.56, 0.49, 0.30, 0.30, 0.27]
    oecd_voice_pr = [0.00, 0.00, 0.02, 0.00, -0.02]
    voice_labels_pr = ['Family Support', 'Feeling Safe', 'Growth Mindset', 'Teacher Relationship', 'Sense of Belonging']

    # KPIs
    st.markdown("<br>", unsafe_allow_html=True)
    col_kpi1, col_kpi2, col_kpi3 = st.columns(3)
    col_kpi1.metric(
        label="Overall Life Satisfaction (CAGS Avg)", 
        value="7.97 / 10", 
        delta="+1.22 vs OECD", 
        help="Self-reported satisfaction with life on a scale of 0 to 10. The OECD baseline average is 6.75."
    )
    col_kpi2.metric(
        label="Exposure to Bullying Index (CAGS)", 
        value="-0.41", 
        delta="-0.41 (Safer)", 
        delta_color="inverse", 
        help="The PISA Exposure to Bullying Index is standardized around an OECD average of 0.00. Negative scores indicate less bullying. A score of -0.41 means the CAGS network is significantly safer than the global baseline."
    )
    col_kpi3.metric(
        label="Math Performance (CAGS Avg)", 
        value="493 Points", 
        delta="+21 vs OECD",
        help="Consolidated average mathematics score compared to the OECD baseline average of 472."
    )
    st.markdown("<br><hr>", unsafe_allow_html=True)
    
    # PR Charts
    c1, c2 = st.columns(2)
    
    with c1:
        subjects = ['Reading', 'Mathematics', 'Science']
        fig_pr1 = go.Figure(data=[
            go.Bar(
                name='CAGS Network', 
                x=subjects, 
                y=cags_cog, 
                marker_color=COLOR_MAP['CAGS Network'], 
                text=cags_cog, 
                textposition='outside'
            ),
            go.Bar(
                name='OECD Average', 
                x=subjects, 
                y=oecd_cog, 
                marker_color=COLOR_MAP['OECD'], 
                text=oecd_cog, 
                textposition='outside'
            )
        ])
        fig_pr1.update_layout(
            barmode='group', 
            title='Cognitive Performance: CAGS vs Global Average', 
            yaxis_title='PISA Score', 
            yaxis_range=[300, 550], 
            margin=dict(t=40, b=20, l=20, r=20), 
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        fig_pr1.update_xaxes(showline=False, showgrid=False, zeroline=False)
        fig_pr1.update_yaxes(showline=False, showgrid=True, gridcolor='rgba(229, 231, 235, 0.4)', zeroline=False)
        
        st.plotly_chart(fig_pr1, use_container_width=True)

    with c2:
        fig_pr2 = go.Figure(data=[
            go.Bar(
                name='CAGS Network', 
                y=voice_labels_pr, 
                x=cags_voice_pr, 
                orientation='h', 
                marker_color='#10B981',  # Nice emerald green for well-being
                text=[f"{val:+.2f}" for val in cags_voice_pr], 
                textposition='outside'
            ),
            go.Bar(
                name='OECD Average', 
                y=voice_labels_pr, 
                x=oecd_voice_pr, 
                orientation='h', 
                marker_color=COLOR_MAP['OECD'], 
                text=[f"{val:+.2f}" for val in oecd_voice_pr], 
                textposition='outside'
            )
        ])
        fig_pr2.update_layout(
            barmode='group', 
            title='Student Well-Being: CAGS vs Global Average', 
            xaxis_title='PISA Index Score (Standard Deviations relative to OECD)', 
            xaxis_range=[-0.2, 0.7], 
            margin=dict(t=40, b=20, l=20, r=20), 
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        fig_pr2.update_xaxes(showline=False, showgrid=True, gridcolor='rgba(229, 231, 235, 0.4)', zeroline=True, zerolinecolor='rgba(0,0,0,0.2)')
        fig_pr2.update_yaxes(showline=False, showgrid=False, zeroline=False)
        
        st.plotly_chart(fig_pr2, use_container_width=True)
