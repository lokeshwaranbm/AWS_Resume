param(
    [string]$BucketName,
    [string]$UserName = "github-actions-deploy",
    [string]$Region = $(if($env:AWS_REGION){$env:AWS_REGION}else{"us-east-1"})
)

function ExitOnError($rc, $msg) {
    if ($rc -ne 0) {
        Write-Error $msg
        exit $rc
    }
}

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI not found. Install and configure AWS CLI before running this script."
    exit 1
}

if (-not $BucketName) {
    $BucketName = Read-Host "Enter the S3 bucket name to use (must be globally unique)"
}

if (-not $BucketName) { Write-Error "Bucket name is required."; exit 1 }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$policyTemplate = Join-Path $scriptDir "..\iam-policy.json"
if (-not (Test-Path $policyTemplate)) {
    Write-Error "Policy template not found at $policyTemplate"
    exit 1
}

$policyContent = Get-Content $policyTemplate -Raw
$policyContent = $policyContent -replace 'REPLACE_WITH_BUCKET_NAME', $BucketName

$tmpPolicy = Join-Path $env:TEMP "deploy-policy-$($BucketName).json"
Set-Content -Path $tmpPolicy -Value $policyContent -Encoding UTF8

Write-Output "Creating IAM user '$UserName' (if it does not already exist)..."
aws iam get-user --user-name $UserName > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    aws iam create-user --user-name $UserName | Out-Null
    ExitOnError $LASTEXITCODE "Failed to create IAM user"
    Write-Output "Created user $UserName"
} else {
    Write-Output "User $UserName already exists"
}

Write-Output "Attaching inline policy to user..."
aws iam put-user-policy --user-name $UserName --policy-name GitHubActionsS3DeployPolicy --policy-document file://$tmpPolicy
ExitOnError $LASTEXITCODE "Failed to attach inline policy"

Write-Output "Creating access key for user..."
$createKey = aws iam create-access-key --user-name $UserName | ConvertFrom-Json
ExitOnError $LASTEXITCODE "Failed to create access key"

$credentialsFile = "deploy-creds-$($UserName).json"
$createKey | ConvertTo-Json -Depth 5 | Out-File -FilePath $credentialsFile -Encoding utf8
Write-Output "Saved credentials to $credentialsFile"

Write-Output "Checking if S3 bucket '$BucketName' exists..."
aws s3api head-bucket --bucket $BucketName 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Output "Bucket does not exist. Creating bucket in region $Region..."
    aws s3 mb s3://$BucketName --region $Region
    ExitOnError $LASTEXITCODE "Failed to create S3 bucket"
    Write-Output "Bucket created: $BucketName"
} else {
    Write-Output "Bucket exists: $BucketName"
}

Write-Output "Syncing current directory to s3://$BucketName (public-read for quick test)..."
aws s3 sync . s3://$BucketName --delete --exclude ".git/*" --exclude ".github/*" --acl public-read
ExitOnError $LASTEXITCODE "Failed to sync files to S3"

Write-Output "Upload complete. If you want the bucket private, remove --acl public-read and configure CloudFront OAC/OAI.
"

Write-Output "Credentials (keep these secret):"
Write-Output "AWS_ACCESS_KEY_ID = $($createKey.AccessKey.AccessKeyId)"
Write-Output "AWS_SECRET_ACCESS_KEY = $($createKey.AccessKey.SecretAccessKey)"
Write-Output "AWS_REGION = $Region"

Write-Output "Add these as GitHub repository secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and set S3_BUCKET to $BucketName."
