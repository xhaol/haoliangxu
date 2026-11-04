"""Record non-secret Pages diagnostics on a separate, unpublished branch."""
import base64
import datetime
import json
import os
import urllib.error
import urllib.request

repository = os.environ['GITHUB_REPOSITORY']
api_base = os.environ['GITHUB_API_URL'] + '/repos/' + repository
headers = {
    'Authorization': 'Bearer ' + os.environ['GH_TOKEN'],
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
}

def api(path, method='GET', data=None):
    request = urllib.request.Request(
        api_base + path, method=method, headers=headers,
        data=None if data is None else json.dumps(data).encode(),
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        body = json.loads(error.read())
        return {'http_status': error.code, 'message': body.get('message', '')}


def select(response, *keys):
    return {key: response[key] for key in keys if key in response}

report = {
    'commit': os.environ['GITHUB_SHA'],
    'run_id': os.environ['GITHUB_RUN_ID'],
    'updated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'deployment_result': os.environ.get('DEPLOYMENT_RESULT'),
    'repository': select(api(''), 'private', 'has_pages', 'default_branch', 'archived', 'http_status', 'message'),
    'pages': select(api('/pages'), 'status', 'build_type', 'source', 'html_url', 'public', 'https_enforced', 'http_status', 'message'),
    'latest_build': select(api('/pages/builds/latest'), 'status', 'commit', 'error', 'created_at', 'updated_at', 'http_status', 'message'),
}
jobs = api('/actions/runs/' + os.environ['GITHUB_RUN_ID'] + '/jobs')
report['jobs'] = [
    {'name': job['name'], 'status': job['status'], 'conclusion': job['conclusion'],
     'steps': [select(step, 'name', 'status', 'conclusion') for step in job.get('steps', [])]}
    for job in jobs.get('jobs', [])
]
branch = 'pages-status'
ref = api('/git/ref/heads/' + branch)
if ref.get('http_status') == 404:
    ref = api('/git/refs', 'POST', {'ref': 'refs/heads/' + branch, 'sha': os.environ['GITHUB_SHA']})
if 'http_status' in ref:
    raise RuntimeError('Could not access diagnostic branch: ' + str(ref))
path = '/contents/pages-status.json'
existing = api(path + '?ref=' + branch)
body = {'message': 'Record Pages deployment status', 'branch': branch,
        'content': base64.b64encode((json.dumps(report, indent=2) + '\n').encode()).decode()}
if 'sha' in existing:
    body['sha'] = existing['sha']
result = api(path, 'PUT', body)
if 'http_status' in result:
    raise RuntimeError('Could not save Pages status: ' + str(result))
print('Saved Pages configuration and deployment status; no credentials included.')
