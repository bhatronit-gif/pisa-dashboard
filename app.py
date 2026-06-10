import streamlit as st
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from math import pi

# Configure the Streamlit page
st.set_page_config(layout="wide", page_title="PISA Dashboard")
st.title("PISA for Schools 2025: Children's Academy")
st.markdown("Comparing cognitive performance, proficiency, and student voice across **Thakur Complex**, **Malad**, and **Ashok Nagar**.")

# --- Comprehensive Dataset Extraction ---
branches = ['Thakur Complex', 'Malad', 'Ashok Nagar']

# Cognitive Averages
df_avg = pd.DataFrame({
    'Branch': branches,
    'Reading': [516, 467, 472],
    'Mathematics': [500, 474, 508],
    'Science': [497, 476, 499]
})

# Proficiency Distribution (Low, Med, High)
prof_data = {
    'Reading': {'Low': [7, 23, 22], 'Med': [83, 75, 75], 'High': [10, 3, 3]},
    'Mathematics': {'Low': [21, 28, 16], 'Med': [66, 65, 71], 'High': [13, 7, 13]},
    'Science': {'Low': [15, 22, 14], 'Med': [80, 75, 79], 'High': [5, 3, 6]}
}

# Gender Gaps (Girls, Boys)
gender_data = {
    'Reading': {'Girls': [515, 480, 479], 'Boys': [518, 458, 466]},
    'Mathematics': {'Girls': [494, 453, 500], 'Boys': [507, 489, 514]},
    'Science': {'Girls': [493, 474, 492], 'Boys': [501, 477, 507]}
}

# Student Voice
categories = ['Belonging', 'Disciplinary Climate', 'Feeling Safe', 'Teacher Relation', 'Growth Mindset']
tc_voice = [0.18, 0.13, 0.49, 0.28, 0.37]
malad_voice = [0.30, -0.04, 0.36, 0.12, 0.14]
ashok_voice = [0.33, 0.36, 0.64, 0.51, 0.42]

# ==========================================
# ROW 1: OVERALL PERFORMANCE & STUDENT VOICE
# ==========================================
st.markdown("---")
col1, col2 = st.columns(2)

with col1:
    fig1, ax1 = plt.subplots(figsize=(8, 5))
    x = np.arange(len(branches))
    width = 0.25
    ax1.bar(x - width, df_avg['Reading'], width, label='Reading', color='#4C72B0')
    ax1.bar(x, df_avg['Mathematics'], width, label='Mathematics', color='#DD8452')
    ax1.bar(x + width, df_avg['Science'], width, label='Science', color='#55A868')
    ax1.set_ylabel('PISA Score')
    ax1.set_title('Average Subject Performance', fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(branches)
    ax1.set_ylim(400, 550) 
    ax1.legend(loc='upper right')
    st.pyplot(fig1)

with col2:
    fig2, ax2 = plt.subplots(figsize=(8, 5), subplot_kw=dict(polar=True))
    N = len(categories)
    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]

    def add_to_radar(ax, values, label, color):
        vals = values + values[:1]
        ax.plot(angles, vals, linewidth=2, linestyle='solid', label=label, color=color)
        ax.fill(angles, vals, alpha=0.1, color=color)

    ax2.set_xticks(angles[:-1])
    ax2.set_xticklabels(categories, size=9)
    ax2.set_ylim(-0.2, 0.7)
    add_to_radar(ax2, tc_voice, 'Thakur Complex', '#4C72B0')
    add_to_radar(ax2, malad_voice, 'Malad', '#C44E52')
    add_to_radar(ax2, ashok_voice, 'Ashok Nagar', '#55A868')
    ax2.set_title('Student Voice Indices (Higher is Better)', fontweight='bold', y=1.1)
    ax2.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    st.pyplot(fig2)


# ==========================================
# ROW 2: INTERACTIVE SUBJECT DEEP DIVES
# ==========================================
st.markdown("---")
st.subheader("Subject Deep Dives: Proficiency & Gender Gaps")
st.markdown("Select a subject tab below to view detailed branch breakdowns.")

# Create Streamlit Tabs
tab_read, tab_math, tab_sci = st.tabs(["📚 Reading", "🧮 Mathematics", "🧪 Science"])

# Helper function to generate the two charts for a specific subject
def render_subject_charts(subject):
    c1, c2 = st.columns(2)
    
    # Chart A: Stacked Proficiency
    with c1:
        fig_prof, ax_prof = plt.subplots(figsize=(8, 4.5))
        low = np.array(prof_data[subject]['Low'])
        med = np.array(prof_data[subject]['Med'])
        high = np.array(prof_data[subject]['High'])
        
        ax_prof.bar(branches, low, label='Below Level 2 (Low)', color='#C44E52')
        ax_prof.bar(branches, med, bottom=low, label='Levels 2-4 (Med)', color='#EAEAF2')
        ax_prof.bar(branches, high, bottom=low+med, label='Levels 5-6 (High)', color='#4C72B0')
        ax_prof.set_ylabel('Percentage of Students (%)')
        ax_prof.set_title(f'{subject} Proficiency Distribution', fontweight='bold')
        
        # Moved legend below chart to prevent overlap
        ax_prof.legend(loc='upper center', bbox_to_anchor=(0.5, -0.15), ncol=3) 
        plt.tight_layout()
        st.pyplot(fig_prof)
        
    # Chart B: Dumbbell Gender Gap
    with c2:
        fig_gen, ax_gen = plt.subplots(figsize=(8, 4.5))
        girls = gender_data[subject]['Girls']
        boys = gender_data[subject]['Boys']
        
        for i in range(len(branches)):
            ax_gen.plot([girls[i], boys[i]], [i, i], color='grey', zorder=1)
            ax_gen.scatter(girls[i], i, color='#C44E52', s=100, label='Girls' if i==0 else "", zorder=2)
            ax_gen.scatter(boys[i], i, color='#4C72B0', s=100, label='Boys' if i==0 else "", zorder=2)
            
            gap = abs(boys[i] - girls[i])
            ax_gen.text((girls[i] + boys[i])/2, i+0.25, f"Gap: {gap} pts", ha='center', fontsize=10, fontweight='bold')
            
        ax_gen.set_yticks(range(len(branches)))
        ax_gen.set_yticklabels(branches)
        ax_gen.set_xlabel('PISA Score')
        ax_gen.set_title(f'Gender Gap in {subject}', fontweight='bold')
        
        # Adjust X-axis automatically so labels don't get cut off
        min_val = min(min(girls), min(boys)) - 15
        max_val = max(max(girls), max(boys)) + 15
        ax_gen.set_xlim(min_val, max_val)
        
        # Moved legend below chart to prevent overlap
        ax_gen.legend(loc='upper center', bbox_to_anchor=(0.5, -0.15), ncol=2)
        plt.tight_layout()
        st.pyplot(fig_gen)

# Render charts inside respective tabs
with tab_read:
    render_subject_charts('Reading')
    
with tab_math:
    render_subject_charts('Mathematics')
    
with tab_sci:
    render_subject_charts('Science')
