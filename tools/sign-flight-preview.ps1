$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$inputApk = Join-Path $root 'app\bin\Release\net10.0-android\publish\com.senisim.sonsuzucus.apk'
$outDir = Join-Path $root 'play-store\releases\preview-1.1.0'
$outputApk = Join-Path $outDir 'sonsuz-ucus-1.1.0-code3-preview.apk'
$keystore = Join-Path $root 'play-store\signing\sonsuz-ucus-upload.jks'
$passwordFile = Join-Path $root 'play-store\signing\upload-key-password.txt'
$signer = 'C:\Program Files (x86)\Android\android-sdk\build-tools\36.0.0\lib\apksigner.jar'
$align = 'C:\Program Files (x86)\Android\android-sdk\build-tools\36.0.0\zipalign.exe'
foreach ($file in @($inputApk, $keystore, $passwordFile, $signer, $align)) {
    if (-not (Test-Path -LiteralPath $file)) { throw "Missing required file: $file" }
}
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$aligned = Join-Path $outDir 'aligned-preview.apk'
& $align -f -p 4 $inputApk $aligned
if ($LASTEXITCODE -ne 0) { throw 'APK alignment failed' }
$passwordText = (Get-Content -LiteralPath $passwordFile -Raw).Trim()
if ($passwordText -match '(?m)^Sifre:\s*(.+)$') { $passwordText = $Matches[1].Trim() }
$env:SONSUZ_PREVIEW_KEY_PASSWORD = $passwordText
try {
    & java -jar $signer sign --ks $keystore --ks-key-alias sonsuzucus --ks-pass env:SONSUZ_PREVIEW_KEY_PASSWORD --key-pass env:SONSUZ_PREVIEW_KEY_PASSWORD --out $outputApk $aligned
    if ($LASTEXITCODE -ne 0) { throw 'APK signing failed' }
} finally {
    Remove-Item Env:\SONSUZ_PREVIEW_KEY_PASSWORD -ErrorAction SilentlyContinue
    $passwordText = $null
}
& java -jar $signer verify --verbose --print-certs $outputApk
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed' }
Remove-Item -LiteralPath $aligned
Get-FileHash -Algorithm SHA256 -LiteralPath $outputApk
Get-Item -LiteralPath $outputApk | Select-Object FullName, Length, LastWriteTime
