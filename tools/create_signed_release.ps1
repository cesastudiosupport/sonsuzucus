param(
    [string]$KeyAlias = "sonsuzucus",
    [string]$DName = "CN=Cesa Studio, OU=Cesa Studio, O=Cesa Studio, L=Istanbul, S=Istanbul, C=TR",
    [switch]$AutoGeneratePassword
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$project = Join-Path $root "app\SonsuzUcus.csproj"
$signingDir = Join-Path $root "play-store\signing"
$keystore = Join-Path $signingDir "sonsuz-ucus-upload.jks"
$passwordFile = Join-Path $signingDir "upload-key-password.txt"
$tempProps = Join-Path $signingDir "signing.temp.props"

New-Item -ItemType Directory -Force -Path $signingDir | Out-Null

function ConvertTo-PlainText([securestring]$secure) {
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Find-Tool([string]$name) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $javaHome = $env:JAVA_HOME
    if ($javaHome) {
        $candidate = Join-Path $javaHome "bin\$name.exe"
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    throw "$name bulunamadi. JAVA_HOME veya JDK kurulumunu kontrol edin."
}

$keytool = Find-Tool "keytool"
$jarsigner = Find-Tool "jarsigner"

Write-Host "Sonsuz Ucus release imzalama basliyor..." -ForegroundColor Cyan
Write-Host "Keystore: $keystore"

if ($AutoGeneratePassword) {
    if (Test-Path $passwordFile) {
        $storePass = (Get-Content -LiteralPath $passwordFile -Raw).Trim()
        if ($storePass -match '(?m)^Sifre:\s*(.+)$') { $storePass = $Matches[1].Trim() }
        $keyPass = $storePass
        Write-Host "Var olan yerel sifre dosyasi kullaniliyor: $passwordFile" -ForegroundColor Yellow
    }
    else {
        $bytes = New-Object byte[] 24
        [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
        $storePass = [Convert]::ToBase64String($bytes).TrimEnd("=")
        $keyPass = $storePass
        @"
Sonsuz Ucus upload key sifresi

Keystore: $keystore
Alias: $KeyAlias
Sifre: $storePass

Bu dosyayi ve .jks dosyasini kaybetmeyin. Play Store guncellemeleri icin gerekir.
"@ | Set-Content -LiteralPath $passwordFile -Encoding UTF8
        Write-Host "Yeni upload key sifresi olusturuldu ve yerel dosyaya yazildi: $passwordFile" -ForegroundColor Yellow
    }
}
else {
    $storePassSecure = Read-Host "Keystore sifresi" -AsSecureString
    $keyPassSecure = Read-Host "Key sifresi (ayni sifreyi kullanabilirsiniz)" -AsSecureString

    $storePass = ConvertTo-PlainText $storePassSecure
    $keyPass = ConvertTo-PlainText $keyPassSecure
}

try {
    if (-not (Test-Path $keystore)) {
        Write-Host "Upload key olusturuluyor..." -ForegroundColor Cyan
        & $keytool -genkeypair -v `
            -keystore $keystore `
            -storetype JKS `
            -keyalg RSA `
            -keysize 4096 `
            -validity 10000 `
            -alias $KeyAlias `
            -dname $DName `
            -storepass $storePass `
            -keypass $keyPass
    }
    else {
        Write-Host "Var olan upload key kullaniliyor." -ForegroundColor Yellow
    }

    Write-Host "Release AAB uretiliyor..." -ForegroundColor Cyan
    dotnet publish $project -c Release -f net10.0-android `
        -p:AndroidPackageFormats=aab `
        -p:AndroidKeyStore=false

    $unsignedAab = Join-Path $root "app\bin\Release\net10.0-android\publish\com.senisim.sonsuzucus.aab"
    $signedAab = Join-Path $root "app\bin\Release\net10.0-android\publish\com.senisim.sonsuzucus-Signed.aab"
    if (-not (Test-Path $unsignedAab)) {
        throw "AAB bulunamadi: $unsignedAab"
    }

    Write-Host "AAB dogru upload key ile imzalaniyor..." -ForegroundColor Cyan
    & $jarsigner `
        -keystore $keystore `
        -storepass $storePass `
        -keypass $keyPass `
        -signedjar $signedAab `
        $unsignedAab `
        $KeyAlias

    Write-Host "Imza kontrol ediliyor..." -ForegroundColor Cyan
    & $jarsigner -verify -certs $signedAab | Out-Host
    & $keytool -printcert -jarfile $signedAab | Select-String -Pattern "SHA1|SHA256|Owner|Sahip" | Out-Host

    Write-Host ""
    Write-Host "YAYIN AAB HAZIR:" -ForegroundColor Green
    Write-Host $signedAab -ForegroundColor Green
}
finally {
    if (Test-Path $tempProps) {
        Remove-Item -LiteralPath $tempProps -Force
    }
    $storePass = $null
    $keyPass = $null
}

