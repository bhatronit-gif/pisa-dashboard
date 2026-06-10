import streamlit as st
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from math import pi

# Configure the Streamlit page
st.set_page_config(layout="wide", page_title="PISA Dashboard")
st.title("PISA for Schools 2025: Children's Academy")
st.markdown("Comparing cognitive performance, proficiency, and student voice across **Thakur Complex**, **Malad**, and **Ashok Nagar**.")

# --- Dataset ---
data = {
    'Branch': ['Thakur Complex', 'Malad', 'Ashok Nagar'],
    'Reading': [516, 467, 472],
    'Mathematics': [500, 474, 508],
    'Science': [497, 476, 499],
    'Math_Prof_Low': [21, 28, 16],
    'Math_Prof_Med': [66, 65, 71],
    'Math_Prof_High': [13, 7, 13]
}
df = pd.DataFrame(data)

categories = ['Belonging', 'Disciplinary Climate', 'Feeling Safe', 'Teacher Relation', 'Growth Mindset']
tc_voice = [0.18, 0.13, 0.49, 0.28, 0.37]
malad_voice = [0.30, -0.04, 0.36, 0.12, 0.14]
ashok_voice = [0.33, 0.36, 0.64, 0.51, 0.42]

# --- Create the Dashboard ---
fig = plt.figure(figsize=(16, 12))

# 1: Grouped Bar Chart (Cognitive Performance)
ax1 = fig.add_subplot(221)
x = np.arange(len(df['Branch']))
width = 0.25
ax1.bar(x - width, df['Reading'], width, label='Reading', color='#4C72B0')
ax1.bar(x, df['Mathematics'], width, label='Mathematics', color='#DD8452')
ax1.bar(x + width, df['Science'], width, label='Science', color='#55A868')
ax1.set_ylabel('PISA Score')
ax1.set_title('Average Subject Performance', fontweight='bold')
ax1.set_xticks(x)
ax1.set_xticklabels(df['Branch'])
ax1.set_ylim(400, 550) 
ax1.legend()

# 2: Stacked Bar Chart (Math Proficiency)
ax2 = fig.add_subplot(222)
ax2.bar(df['Branch'], df['Math_Prof_Low'], label='Below Level 2 (Low)', color='#C44E52')
ax2.bar(df['Branch'], df['Math_Prof_Med'], bottom=df['Math_Prof_Low'], label='Levels 2-4 (Med)', color='#EAEAF2')
ax2.bar(df['Branch'], df['Math_Prof_High'], bottom=df['Math_Prof_Low'] + df['Math_Prof_Med'], label='Levels 5-6 (High)', color='#4C72B0')
ax2.set_ylabel('Percentage of Students (%)')
ax2.set_title('Mathematics Proficiency Distribution', fontweight='bold')
ax2.legend(loc='upper right', bbox_to_anchor=(1.35, 1))

# 3: Radar Chart (Student Voice/Environment)
ax3 = fig.add_subplot(223, polar=True)
N = len(categories)
angles = [n / float(N) * 2 * pi for n in range(N)]
angles += angles[:1]

def add_to_radar(ax, values, label, color):
    vals = values + values[:1] # Closes the circle
    ax.plot(angles, vals, linewidth=2, linestyle='solid', label=label, color=color)
    ax.fill(angles, vals, alpha=0.1, color=color)

ax3.set_xticks(angles[:-1])
ax3.set_xticklabels(categories, size=10)
ax3.set_ylim(-0.2, 0.7)
add_to_radar(ax3, tc_voice, 'Thakur Complex', '#4C72B0')
add_to_radar(ax3, malad_voice, 'Malad', '#C44E52')
add_to_radar(ax3, ashok_voice, 'Ashok Nagar', '#55A868')
ax3.set_title('Student Voice Indices (Higher is Better)', fontweight='bold', y=1.1)
ax3.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))

# 4: Dumbbell Chart (Math Gender Gap)
ax4 = fig.add_subplot(224)
math_boys = [507, 489, 514]
math_girls = [494, 453, 500]

for i, branch in enumerate(df['Branch']):
    ax4.plot([math_girls[i], math_boys[i]], [i, i], color='grey', zorder=1)
    ax4.scatter(math_girls[i], i, color='#C44E52', s=100, label='Girls' if i==0 else "", zorder=2)
    ax4.scatter(math_boys[i], i, color='#4C72B0', s=100, label='Boys' if i==0 else "", zorder=2)
    ax4.text((math_girls[i] + math_boys[i])/2, i+0.15, f"Gap: {abs(math_boys[i]-math_girls[i])} pts", ha='center', fontsize=9)

ax4.set_yticks(range(len(df['Branch'])))
ax4.set_yticklabels(df['Branch'])
ax4.set_xlabel('Mathematics Score')
ax4.set_title('Gender Gap in Mathematics', fontweight='bold')
ax4.legend()

plt.tight_layout(rect=[0, 0, 1, 0.95])

# Send the plot to Streamlit
st.pyplot(fig)
