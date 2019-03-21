import json
import os
from sys import argv

with open(argv[1]) as f:
    x = json.load(f)

cslug, ext = os.path.splitext(os.path.basename(argv[1]))
print(cslug)

x = {'models': [{
    'max_score': prob.get('max_score', 100),
    'slug': prob['slug'],
    'contest_slug': prob.get('contest_slug', cslug),
    'name': prob.get('name', prob['slug']),
} for prob in x['models']]}

with open(argv[1], 'w') as f:
    json.dump(x, f)
