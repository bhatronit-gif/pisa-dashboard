import streamlit as st
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from math import pi

# --- PAGE CONFIGURATION ---
st.set_page_config(layout="wide", page_title="CAGS PISA Dashboard")

# Header
st.title("🌟 PISA for Schools 2025: Children's Academy Group")
st.markdown("Showcasing the consolidated network excellence of **Thakur Complex**, **Malad**, and **Ashok Nagar** against the global OECD benchmark.")

# ==========================================
# DATASET DEFINITIONS
# ==========================================

# 1. Consolidated Network Data vs OECD
cags_cog = [484, 493, 490]  # Reading, Math, Science
oecd_cog = [476, 472, 485]

voice_labels = ['Family Support', 'Feeling Safe', 'Growth Mindset', 'Teacher Relationship', 'Sense of Belonging']
cags_voice = [0.56, 0.49, 0.30, 0.30, 0.27]
oecd_voice = [0.00, 0.00, 0.02, 0.00, -0.02]

# 2. Branch Level Data
branches = ['Thakur Complex', 'Malad', 'Ashok Nagar']
df_avg = pd.DataFrame({
    'Branch': branches,
    'Reading': [516, 467, 472],
    'Mathematics': [500, 474, 508],
    'Science': [497, 476, 499]
})

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

categories = ['Belonging', 'Disciplinary Climate', 'Feeling Safe', 'Teacher Relation', 'Growth Mindset']
tc_voice = [0.18, 0.13, 0.49, 0.28, 0.37]
malad_voice = [0.30, -0.04, 0.36, 0.12, 0.14]
ashok_voice = [0.33, 0.36, 0.64, 0.51, 0.42]

# ==========================================
# CREATE TABS
# ==========================================
tab_pr, tab_cog, tab_voice = st.tabs([
    "🏆 Network vs OECD (PR Showcase)", 
    "🏫 Branch Cognitive Breakdown", 
    "🗣️ Branch Voice & Equity"
])

# ==========================================
# TAB 1: PR SHOWCASE (CAGS VS OECD)
# ==========================================
with tab_pr:
    st.markdown("### The Global Benchmark: CAGS vs. OECD")
    st.markdown("By combining our data, the Children's Academy network vividly demonstrates that our educational standards and student well-being dramatically outperform international baseline averages.")
    
    # KPIs for highly shareable metrics
    col_kpi1, col_kpi2, col_kpi3 = st.columns(3)
    with col_kpi1:
        st.metric(label="Overall Life Satisfaction (CAGS)", value="7.97 / 10", delta="1.22 points higher than OECD")
    with col_kpi2:
        st.metric(label="Exposure to Bullying (CAGS)", value="-0.41 Index", delta="Safer than the OECD (-0.30)", delta_color="inverse")
    with col_kpi3:
        st.metric(label="Math Performance (CAGS)", value="493 Points", delta="21 points higher than OECD")
        
    st.markdown("---")
    
    # Charts for PR
    c1, c2 = st.columns(2)
    
    # PR Chart 1: Cognitive Performance
    with c1:
        fig_pr1, ax_pr1 = plt.subplots(figsize=(8, 5))
        x = np.arange(3)
        width = 0.35
        
        # Plotting
        rects1 = ax_pr1.bar(x - width/2, cags_cog, width, label='CAGS Network', color='#1E40AF') # Deep Blue
        rects2 = ax_pr1.bar(x + width/2, oecd_cog, width, label='OECD Average', color='#9CA3AF') # Gray
        
        # Add labels on top of bars for easy screenshotting
        ax_pr1.bar_label(rects1, padding=3, fontweight='bold', color='#1E40AF')
        ax_pr1.bar_label(rects2, padding=3, color='#4B5563')
        
        ax_pr1.set_ylabel('PISA Score')
        ax_pr1.set_title('Cognitive Performance: CAGS vs Global Average', fontweight='bold')
        ax_pr1.set_xticks(x)
        ax_pr1.set_xticklabels(['Reading', 'Mathematics', 'Science'], fontsize=11, fontweight='bold')
        ax_pr1.set_ylim(440, 520)
        ax_pr1.legend(loc='upper left')
        
        st.pyplot(fig_pr1)

    # PR Chart 2: Student Well-being
    with c2:
        fig_pr2, ax_pr2 = plt.subplots(figsize=(8, 5))
        y = np.arange(len(voice_labels))
        width = 0.35
        
        # Horizontal bars work best for index labels to show the difference from 0
        rects3 = ax_pr2.barh(y + width/2, cags_voice, width, label='CAGS Network', color='#059669') # Vibrant Green
        rects4 = ax_pr2.barh(y - width/2, oecd_voice, width, label='OECD Average', color='#9CA3AF') # Gray
        
        ax_pr2.set_xlabel('PISA Index Score (Higher is Better)')
        ax_pr2.set_title('Student Well-Being & Culture: CAGS vs Global Average', fontweight='bold')
        ax_pr2.set_yticks(y)
        ax_pr2.set_yticklabels(voice_labels, fontsize=11, fontweight='bold')
        
        # Add labels to the ends of the bars
        ax_pr2.bar_label(rects3, padding=5, fontweight='bold', color='#059669', fmt='%.2f')
        ax_pr2.bar_label(rects4, padding=5, color='#4B5563', fmt='%.2f')
        
        ax_pr2.set_xlim(-0.1, 0.7)
        ax_pr2.legend(loc='lower right')
        
        st.pyplot(fig_pr2)

# ==========================================
# TAB 2: BRANCH COGNITIVE BREAKDOWN
# ==========================================
with tab_cog:
    st.markdown("### Internal Branch Benchmarking")
    
    fig1, ax1 = plt.subplots(figsize=(12, 5))
    x = np.arange(len(branches))
    width = 0.25
    ax1.bar(x - width, df_avg['Reading'], width, label='Reading', color='#4C72B0')
    ax1.bar(x, df_avg['Mathematics'], width, label='Mathematics', color='#DD8452')
    ax1.bar(x + width, df_avg['Science'], width, label='Science', color='#55A868')
    ax1.set_ylabel('PISA Score')
    ax1.set_title('Average Subject Performance by Branch', fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(branches)
    ax1.set_ylim(400, 550) 
    ax1.legend(loc='upper right')
    st.pyplot(fig1)
    
    st.markdown("---")
    st.markdown("#### Proficiency Distributions by Subject")
    subject = st.selectbox("Select Subject to View Proficiency:", ['Reading', 'Mathematics', 'Science'])
    
    fig_prof, ax_prof = plt.subplots(figsize=(10, 4))
    low = np.array(prof_data[subject]['Low'])
    med = np.array(prof_data[subject]['Med'])
    high = np.array(prof_data[subject]['High'])
    
    ax_prof.bar(branches, low, label='Below Level 2 (Low)', color='#C44E52')
    ax_prof.bar(branches, med, bottom=low, label='Levels 2-4 (Med)', color='#EAEAF2')
    ax_prof.bar(branches, high, bottom=low+med, label='Levels 5-6 (High)', color='#4C72B0')
    ax_prof.set_ylabel('Percentage of Students (%)')
    ax_prof.set_title(f'{subject} Proficiency Distribution', fontweight='bold')
    ax_prof.legend(loc='upper center', bbox_to_anchor=(0.5, -0.15), ncol=3) 
    st.pyplot(fig_prof)

# ==========================================
# TAB 3: BRANCH VOICE & EQUITY
# ==========================================
with tab_voice:
    c3, c4 = st.columns(2)
    
    with c3:
        st.markdown("#### Student Voice Radar")
        fig2, ax2 = plt.subplots(figsize=(8, 6), subplot_kw=dict(polar=True))
        N = len(categories)
        angles = [n / float(N) * 2 * pi for n in range(N)]
        angles += angles[:1]

        def add_to_radar(ax, values, label, color):
            vals = values + values[:1]
            ax.plot(angles, vals, linewidth=2, linestyle='solid', label=label, color=color)
            ax.fill(angles, vals, alpha=0.1, color=color)

        ax2.set_xticks(angles[:-1])
        ax2.set_xticklabels(categories, size=10)
        ax2.set_ylim(-0.2, 0.7)
        add_to_radar(ax2, tc_voice, 'Thakur Complex', '#4C72B0')
        add_to_radar(ax2, malad_voice, 'Malad', '#C44E52')
        add_to_radar(ax2, ashok_voice, 'Ashok Nagar', '#55A868')
        ax2.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
        st.pyplot(fig2)

    with c4:
        st.markdown("#### Gender Gaps")
        subject_gap = st.selectbox("Select Subject:", ['Reading', 'Mathematics', 'Science'], key='gap')
        
        fig_gen, ax_gen = plt.subplots(figsize=(8, 6))
        girls = gender_data[subject_gap]['Girls']
        boys = gender_data[subject_gap]['Boys']
        
        for i in range(len(branches)):
            ax_gen.plot([girls[i], boys[i]], [i, i], color='grey', zorder=1)
            ax_gen.scatter(girls[i], i, color='#C44E52', s=100, label='Girls' if i==0 else "", zorder=2)
            ax_gen.scatter(boys[i], i, color='#4C72B0', s=100, label='Boys' if i==0 else "", zorder=2)
            
            gap = abs(boys[i] - girls[i])
            ax_gen.text((girls[i] + boys[i])/2, i+0.25, f"Gap: {gap} pts", ha='center', fontsize=10, fontweight='bold')
            
        ax_gen.set_yticks(range(len(branches)))
        ax_gen.set_yticklabels(branches)
        ax_gen.set_xlabel('PISA Score')
        
        min_val = min(min(girls), min(boys)) - 15
        max_val = max(max(girls), max(boys)) + 15
        ax_gen.set_xlim(min_val, max_val)
        
        ax_gen.legend(loc='upper center', bbox_to_anchor=(0.5, -0.15), ncol=2)
        st.pyplot(fig_gen)
