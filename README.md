# cms-content-stage

## set-up

1. 新增 Secret: Github content repo 頁面 -> Settings -> Secrets -> Actions -> New repository secret -> Name: CI_TOKEN, Value: {Personal access token}
2. 取得WORKFLOW_ID: curl -X GET -H "Authorization: token {CI_TOKEN}" https://api.github.com/repos/{owner}/{repo}/actions/workflows
3. 更新 optimize-images.yml -> Trigger parent module workflow 環境變數 (PARENT_REPO, WORKFLOW_ID)
