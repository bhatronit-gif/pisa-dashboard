import streamlit as st
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from math import pi

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
    c4.metric("Socio-Economic Index", demo_data['ESCS (Socio-Economic Index)'][idx])
    
    st.markdown("---")
    
    colA, colB = st.columns(2)
    with colA:
        # Cognitive Chart 
        st.markdown("#### Cognitive Performance")
        fig_ind, ax_ind = plt.subplots(figsize=(8, 5))
        x = np.arange(3)
        width = 0.25
        
        branch_scores = cog_data[selected_branch]
        oecd_scores = cog_data['OECD']
        
        rects1 = ax_ind.bar(x - width/2, branch_scores, width, label=selected_branch, color='#1E40AF')
        rects2 = ax_ind.bar(x + width/2, oecd_scores, width, label='OECD Avg', color='#9CA3AF')
        
        ax_ind.bar_label(rects1, padding=3, fontweight='bold', color='#1E40AF')
        ax_ind.bar_label(rects2, padding=3, color='#4B5563')
        
        ax_ind.set_ylabel('PISA Score')
        ax_ind.set_xticks(x)
        ax_ind.set_xticklabels(['Reading', 'Mathematics', 'Science'])
        ax_ind.set_ylim(400, 550)
        ax_ind.legend()
        st.pyplot(fig_ind)

    with colB:
        # Voice Chart
        st.markdown("#### Student Voice & Culture (0 = OECD Avg)")
        fig_r, ax_r = plt.subplots(figsize=(8, 5), subplot_kw=dict(polar=True))
        N = len(voice_categories)
        angles = [n / float(N) * 2 * pi for n in range(N)]
        angles += angles[:1]

        vals = voice_data[selected_branch] + voice_data[selected_branch][:1]
        ax_r.plot(angles, vals, linewidth=2, linestyle='solid', color='#059669', label=selected_branch)
        ax_r.fill(angles, vals, alpha=0.2, color='#059669')
        
        ax_r.set_xticks(angles[:-1])
        ax_r.set_xticklabels(voice_categories, size=10)
        ax_r.set_ylim(-0.2, 0.7)
        ax_r.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
        st.pyplot(fig_r)

# ==========================================
# PAGE 3: COMPARATIVE REPORTS
# ==========================================
elif page == "3. Comparative School Reports":
    st.title("📊 Comparative School Reports")
    st.markdown("Benchmarking the Thakur Complex, Malad, and Ashok Nagar branches against one another to spot internal trends.")
    
    # Cognitive Performance
    st.subheader("1. Average Subject Performance by Branch")
    fig_comp1, ax_comp1 = plt.subplots(figsize=(12, 4))
    x = np.arange(3)
    width = 0.25
    ax_comp1.bar(x - width, [cog_data[b][0] for b in branches], width, label='Reading', color='#4C72B0')
    ax_comp1.bar(x, [cog_data[b][1] for b in branches], width, label='Mathematics', color='#DD8452')
    ax_comp1.bar(x + width, [cog_data[b][2] for b in branches], width, label='Science', color='#55A868')
    ax_comp1.set_ylabel('PISA Score')
    ax_comp1.set_xticks(x)
    ax_comp1.set_xticklabels(branches, fontweight='bold')
    ax_comp1.set_ylim(400, 550)
    ax_comp1.legend(loc='upper right')
    st.pyplot(fig_comp1)
    
    # Proficiency and Gender Gaps
    st.markdown("---")
    st.subheader("2. Subject Deep Dives (Proficiency & Equity)")
    subject = st.selectbox("Select Subject:", ['Reading', 'Mathematics', 'Science'])
    
    colA, colB = st.columns(2)
    with colA:
        fig_prof, ax_prof = plt.subplots(figsize=(7, 4.5))
        low = np.array(prof_data[subject]['Low'])
        med = np.array(prof_data[subject]['Med'])
        high = np.array(prof_data[subject]['High'])
        
        ax_prof.bar(branches, low, label='Below Level 2', color='#C44E52')
        ax_prof.bar(branches, med, bottom=low, label='Levels 2-4', color='#EAEAF2')
        ax_prof.bar(branches, high, bottom=low+med, label='Levels 5-6', color='#4C72B0')
        ax_prof.set_title(f'{subject} Proficiency', fontweight='bold')
        ax_prof.legend(loc='lower center', bbox_to_anchor=(0.5, -0.25), ncol=3)
        st.pyplot(fig_prof)
        
    with colB:
        fig_gen, ax_gen = plt.subplots(figsize=(7, 4.5))
        girls = gender_data[subject]['Girls']
        boys = gender_data[subject]['Boys']
        
        for i in range(3):
            ax_gen.plot([girls[i], boys[i]], [i, i], color='grey', zorder=1)
            ax_gen.scatter(girls[i], i, color='#C44E52', s=100, label='Girls' if i==0 else "", zorder=2)
            ax_gen.scatter(boys[i], i, color='#4C72B0', s=100, label='Boys' if i==0 else "", zorder=2)
            gap = abs(boys[i] - girls[i])
            ax_gen.text((girls[i] + boys[i])/2, i+0.25, f"Gap: {gap}", ha='center', fontsize=10)
            
        ax_gen.set_yticks(range(3))
        ax_gen.set_yticklabels(branches)
        ax_gen.set_title(f'Gender Gap in {subject}', fontweight='bold')
        ax_gen.set_xlim(min(min(girls), min(boys)) - 10, max(max(girls), max(boys)) + 15)
        ax_gen.legend(loc='lower center', bbox_to_anchor=(0.5, -0.25), ncol=2)
        st.pyplot(fig_gen)
        
    # Radar Chart
    st.markdown("---")
    st.subheader("3. Student Voice & Culture Comparison")
    fig_radar, ax_radar = plt.subplots(figsize=(8, 6), subplot_kw=dict(polar=True))
    N = len(voice_categories)
    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]

    def add_to_radar(ax, values, label, color):
        vals = values + values[:1]
        ax.plot(angles, vals, linewidth=2, linestyle='solid', label=label, color=color)
        ax.fill(angles, vals, alpha=0.1, color=color)

    ax_radar.set_xticks(angles[:-1])
    ax_radar.set_xticklabels(voice_categories, size=10)
    ax_radar.set_ylim(-0.2, 0.7)
    add_to_radar(ax_radar, voice_data['Thakur Complex'], 'Thakur Complex', '#4C72B0')
    add_to_radar(ax_radar, voice_data['Malad'], 'Malad', '#C44E52')
    add_to_radar(ax_radar, voice_data['Ashok Nagar'], 'Ashok Nagar', '#55A868')
    ax_radar.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    st.pyplot(fig_radar)


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
    col_kpi1.metric(label="Overall Life Satisfaction (CAGS)", value="7.97 / 10", delta="1.22 points higher than OECD")
    col_kpi2.metric(label="Exposure to Bullying (CAGS)", value="-0.41 Index", delta="Safer than the OECD (-0.30)", delta_color="inverse")
    col_kpi3.metric(label="Math Performance (CAGS)", value="493 Points", delta="21 points higher than OECD")
    st.markdown("<br><hr>", unsafe_allow_html=True)
    
    # PR Charts
    c1, c2 = st.columns(2)
    
    with c1:
        fig_pr1, ax_pr1 = plt.subplots(figsize=(8, 6))
        x = np.arange(3)
        width = 0.35
        
        rects1 = ax_pr1.bar(x - width/2, cags_cog, width, label='CAGS Network', color='#1E40AF')
        rects2 = ax_pr1.bar(x + width/2, oecd_cog, width, label='OECD Average', color='#9CA3AF')
        
        ax_pr1.bar_label(rects1, padding=3, fontweight='bold', color='#1E40AF')
        ax_pr1.bar_label(rects2, padding=3, color='#4B5563')
        
        ax_pr1.set_ylabel('PISA Score')
        ax_pr1.set_title('Cognitive Performance: CAGS vs Global Average', fontweight='bold')
        ax_pr1.set_xticks(x)
        ax_pr1.set_xticklabels(['Reading', 'Mathematics', 'Science'], fontsize=11, fontweight='bold')
        ax_pr1.set_ylim(440, 520)
        ax_pr1.legend(loc='upper left')
        st.pyplot(fig_pr1)

    with c2:
        fig_pr2, ax_pr2 = plt.subplots(figsize=(8, 6))
        y = np.arange(len(voice_labels_pr))
        width = 0.35
        
        rects3 = ax_pr2.barh(y + width/2, cags_voice_pr, width, label='CAGS Network', color='#059669') 
        rects4 = ax_pr2.barh(y - width/2, oecd_voice_pr, width, label='OECD Average', color='#9CA3AF') 
        
        ax_pr2.set_xlabel('PISA Index Score (Higher is Better)')
        ax_pr2.set_title('Student Well-Being: CAGS vs Global Average', fontweight='bold')
        ax_pr2.set_yticks(y)
        ax_pr2.set_yticklabels(voice_labels_pr, fontsize=11, fontweight='bold')
        
        ax_pr2.bar_label(rects3, padding=5, fontweight='bold', color='#059669', fmt='%.2f')
        ax_pr2.bar_label(rects4, padding=5, color='#4B5563', fmt='%.2f')
        
        ax_pr2.set_xlim(-0.1, 0.7)
        ax_pr2.legend(loc='lower right')
        st.pyplot(fig_pr2)
