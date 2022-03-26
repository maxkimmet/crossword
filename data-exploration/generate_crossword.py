# %%
from datetime import timedelta
import json
import os
import pandas as pd
import time

from crossword_helper import Crossword
# %%
# Import clues
df_clues = pd.read_csv('data/sorted_clues.csv')
# %%
# Filter answers based on last year used
df_clues = df_clues[df_clues.max_year >= 2000]
# %%
# Filter answers based on answer length
df_clues['answer_length'] = df_clues.answer.apply(lambda x: len(x))
df_clues = df_clues[(df_clues.answer_length >= 2) & (df_clues.answer_length <= 15)]
# %%
# Sort distinct answers by frequency (ignoring different clues)
df_answers = df_clues.groupby('answer') \
    .agg(
        answer_count=('clue_count', 'sum'),
        answer_length=('answer_length', 'max')
    ) \
    .reset_index() \
    .sort_values('answer_count', ascending=False) \
    .reset_index()
df_answers.drop('index', axis=1, inplace=True)
# %%
# Drop answers with only one use
df_answers = df_answers[df_answers.answer_count >= 2]
# %%
# Filter clues based on pool of answers
df_clues = df_clues[df_clues.answer.isin(df_answers.answer)]
# %%
# Assign most common clue to each answer
df_clues = df_clues.sort_values('clue_count', ascending=False).reset_index()
df_clues.drop('index', axis=1, inplace=True)
df_clues = df_clues.groupby('answer') \
    .agg(
        clue=('clue', 'first'),
        answer_count=('clue_count', 'sum'),
        answer_length=('answer_length', 'first')
    ) \
    .reset_index() \
    .sort_values('answer_count', ascending=False) \
    .reset_index()
# %%
# Filter to most common answers of each length
clues = []
for length in df_clues.answer_length.unique():
    df_filtered = df_clues[df_clues.answer_length == length]
    df_filtered = df_filtered.sort_values('answer_count', ascending=False)
    df_filtered = df_filtered.head(int(len(df_filtered) * 0.1))
    df_filtered = df_filtered[['answer', 'clue']]
    for row in df_filtered.values:
        clues.append({
            'answer': row[0],
            'clue': row[1],
            'priority': 1
        })
# %%
# Generate blacklist with recently used words
blacklist_size = 10000  # Number of recent words to ignore
blacklist = set()
xword_dir = r"../CrosswordWeb/Crosswords"
for year in reversed(sorted(os.listdir(xword_dir))):
    if len(blacklist) > blacklist_size:
        break
    for xword in reversed(sorted(os.listdir(os.path.join(xword_dir, year)))):
        if len(blacklist) > blacklist_size:
            break
        with open(os.path.join(xword_dir, year, xword)) as f:
            data = json.load(f)
            blacklist.update(set([entry['word'] for entry in data['entries']]))
# %%
# Generate crossword
start_time = time.time()
crossword = Crossword("inputs/15x15-0.json", clues)
crossword.generate("crossword.json", blacklist)
print(f"Crossword generated in {timedelta(seconds=int(time.time()-start_time))}")
# %%
