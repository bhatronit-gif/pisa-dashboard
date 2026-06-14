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

# ==========================================
# SIDEBAR NAVIGATION
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
    st.subheader("Which Countries Make up the OECD?")
    st.markdown("The 38 member countries represent a vast majority of the world's wealth and educational advancement. Notable members include:")
    st.markdown("""
    *   🇦🇺 **Oceania:** Australia, New Zealand
    *   🇺🇸 **North America:** United States, Canada, Mexico
    *   🇪🇺 **Europe:** United Kingdom, Germany, Finland, France, Sweden, Switzerland, Spain, Italy
    *   🌏 **Asia:** Japan, South Korea
    """)
    
    with st.expander("🌍 Click here to see the full list of 38 OECD Countries"):
        st.write("""
        *Australia, Austria, Belgium, Canada, Chile, Colombia, Costa Rica, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, 
        Hungary, Iceland, Ireland, Israel, Italy, Japan, Korea, Latvia, Lithuania, Luxembourg, Mexico, Netherlands, New Zealand, 
        Norway, Poland, Portugal, Slovak Republic, Slovenia, Spain, Sweden, Switzerland, Türkiye, United Kingdom, and the United States.*
        """)

# ==========================================
# PAGE 2: INDIVIDUAL SCHOOL REPORTS
# ==========================================
elif page == "2. Individual School Reports":
    st.title("🏫 Individual School Reports")
    st.markdown("Select a branch below to view its specific demographic context and performance metrics against global benchmarks.")
    
    selected_branch = st.selectbox("Select Branch:", branches)
    idx = branches.index(selected_branch)
    
    # Demographics
    st.subheader(f"Snapshot: {selected_branch}")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Students Tested", demo_data['Students'][idx])
    c2.metric("Boys", f"{demo_data['Boys (%)'][idx]}%")
    c3.metric("Girls", f"{demo_data['Girls (%)'][idx]}%")
    c4.metric("Socio-Economic Index", demo_data['ESCS (Socio-Economic Index)'][idx], help="The PISA index of economic, social and cultural status (ESCS) is a summary measure of a student's family and home background. Higher means higher status.")
    
    st.markdown("---")
    
    colA, colB = st.columns(2)
    with colA:
        # Cognitive Chart 
        st.markdown("#### Cognitive Performance")
        subjects = ['Reading', 'Mathematics', 'Science']
        branch_scores = cog_data[selected_branch]
        oecd_scores = cog_data['OECD']
        
        fig_ind = go.Figure(data=[
            go.Bar(name=selected_branch, x=subjects, y=branch_scores, marker_color='#1E40AF', text=branch_scores, textposition='outside'),
            go.Bar(name='OECD Avg', x=subjects, y=oecd_scores, marker_color='#9CA3AF', text=oecd_scores, textposition='outside')
        ])
        fig_ind.update_layout(barmode='group', yaxis_title='PISA Score', yaxis_range=[400, 560], margin=dict(t=20, b=20, l=20, r=20), legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1))
        st.plotly_chart(fig_ind, use_container_width=True)

    with colB:
        # Voice Chart
        st.markdown("#### Student Voice & Culture (0 = OECD Avg)")
        fig_r = go.Figure()

        vals = voice_data[selected_branch] + [voice_data[selected_branch][0]]
        cats = voice_categories + [voice_categories[0]]
        
        fig_r.add_trace(go.Scatterpolar(
            r=vals,
            theta=cats,
            fill='toself',
            name=selected_branch,
            line_color='#059669',
            fillcolor='rgba(5, 150, 105, 0.2)'
        ))

        fig_r.update_layout(
            polar=dict(radialaxis=dict(visible=True, range=[-0.2, 0.7])),
            showlegend=True,
            margin=dict(t=20, b=20, l=20, r=20)
        )
        st.plotly_chart(fig_r, use_container_width=True)

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
        go.Bar(name='Reading', x=branches, y=[cog_data[b][0] for b in branches], marker_color='#4C72B0'),
        go.Bar(name='Mathematics', x=branches, y=[cog_data[b][1] for b in branches], marker_color='#DD8452'),
        go.Bar(name='Science', x=branches, y=[cog_data[b][2] for b in branches], marker_color='#55A868')
    ])
    fig_comp1.update_layout(barmode='group', yaxis_title='PISA Score', yaxis_range=[400, 550], margin=dict(t=20, b=20, l=20, r=20), legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1))
    st.plotly_chart(fig_comp1, use_container_width=True)
    
    # Proficiency and Gender Gaps
    st.markdown("---")
    st.subheader("2. Subject Deep Dives (Proficiency & Equity)")
    subject = st.selectbox("Select Subject:", ['Reading', 'Mathematics', 'Science'])
    
    colA, colB = st.columns(2)
    with colA:
        low = prof_data[subject]['Low']
        med = prof_data[subject]['Med']
        high = prof_data[subject]['High']
        
        fig_prof = go.Figure(data=[
            go.Bar(name='Below Level 2', x=branches, y=low, marker_color='#C44E52'),
            go.Bar(name='Levels 2-4', x=branches, y=med, marker_color='#EAEAF2'),
            go.Bar(name='Levels 5-6', x=branches, y=high, marker_color='#4C72B0')
        ])
        fig_prof.update_layout(barmode='stack', title=f'{subject} Proficiency', margin=dict(t=40, b=20, l=20, r=20), legend=dict(orientation="h", yanchor="top", y=-0.1, xanchor="center", x=0.5))
        st.plotly_chart(fig_prof, use_container_width=True)
        
    with colB:
        girls = gender_data[subject]['Girls']
        boys = gender_data[subject]['Boys']
        
        fig_gen = go.Figure()

        for i, branch in enumerate(branches):
            fig_gen.add_trace(go.Scatter(x=[girls[i], boys[i]], y=[branch, branch], mode='lines', line=dict(color='grey'), showlegend=False))
            
            # Text annotation for gap
            gap = abs(boys[i] - girls[i])
            fig_gen.add_annotation(x=(girls[i] + boys[i])/2, y=branch, text=f"Gap: {gap}", showarrow=False, yshift=15)

        fig_gen.add_trace(go.Scatter(x=girls, y=branches, mode='markers', name='Girls', marker=dict(color='#C44E52', size=15)))
        fig_gen.add_trace(go.Scatter(x=boys, y=branches, mode='markers', name='Boys', marker=dict(color='#4C72B0', size=15)))

        fig_gen.update_layout(title=f'Gender Gap in {subject}', xaxis_title="Score", yaxis_autorange="reversed", margin=dict(t=40, b=20, l=20, r=20), legend=dict(orientation="h", yanchor="top", y=-0.1, xanchor="center", x=0.5))
        st.plotly_chart(fig_gen, use_container_width=True)
        
    # Radar Chart
    st.markdown("---")
    st.subheader("3. Student Voice & Culture Comparison")

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
            fillcolor=f'rgba({int(color[1:3], 16)}, {int(color[3:5], 16)}, {int(color[5:7], 16)}, 0.1)'
        ))

    add_to_radar(fig_radar, voice_data['Thakur Complex'], 'Thakur Complex', '#4C72B0')
    add_to_radar(fig_radar, voice_data['Malad'], 'Malad', '#C44E52')
    add_to_radar(fig_radar, voice_data['Ashok Nagar'], 'Ashok Nagar', '#55A868')

    fig_radar.update_layout(
        polar=dict(radialaxis=dict(visible=True, range=[-0.2, 0.7])),
        showlegend=True,
        margin=dict(t=20, b=20, l=20, r=20)
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
    col_kpi1.metric(label="Overall Life Satisfaction (CAGS)", value="7.97 / 10", delta="1.22 points higher than OECD", help="Self-reported satisfaction with life on a scale of 0 to 10.")
    col_kpi2.metric(label="Exposure to Bullying (CAGS)", value="-0.41 Index", delta="Safer than the OECD (-0.30)", delta_color="inverse", help="Negative scores indicate LESS exposure to bullying, meaning a safer environment.")
    col_kpi3.metric(label="Math Performance (CAGS)", value="493 Points", delta="21 points higher than OECD")
    st.markdown("<br><hr>", unsafe_allow_html=True)
    
    # PR Charts
    c1, c2 = st.columns(2)
    
    with c1:
        subjects = ['Reading', 'Mathematics', 'Science']
        fig_pr1 = go.Figure(data=[
            go.Bar(name='CAGS Network', x=subjects, y=cags_cog, marker_color='#1E40AF', text=cags_cog, textposition='outside'),
            go.Bar(name='OECD Average', x=subjects, y=oecd_cog, marker_color='#9CA3AF', text=oecd_cog, textposition='outside')
        ])
        fig_pr1.update_layout(barmode='group', title='Cognitive Performance: CAGS vs Global Average', yaxis_title='PISA Score', yaxis_range=[440, 520], margin=dict(t=40, b=20, l=20, r=20), legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1))
        st.plotly_chart(fig_pr1, use_container_width=True)

    with c2:
        fig_pr2 = go.Figure(data=[
            go.Bar(name='CAGS Network', y=voice_labels_pr, x=cags_voice_pr, orientation='h', marker_color='#059669', text=[f"{val:.2f}" for val in cags_voice_pr], textposition='outside'),
            go.Bar(name='OECD Average', y=voice_labels_pr, x=oecd_voice_pr, orientation='h', marker_color='#9CA3AF', text=[f"{val:.2f}" for val in oecd_voice_pr], textposition='outside')
        ])
        fig_pr2.update_layout(barmode='group', title='Student Well-Being: CAGS vs Global Average', xaxis_title='PISA Index Score (Higher is Better)', xaxis_range=[-0.1, 0.7], margin=dict(t=40, b=20, l=20, r=20), legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1))
        st.plotly_chart(fig_pr2, use_container_width=True)
