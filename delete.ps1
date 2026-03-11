$files = @(
    "c:\Users\bedel\OneDrive\Desktop\Olvon\mobile-app\lib\stripe.ts",
    "c:\Users\bedel\OneDrive\Desktop\Olvon\mobile-app\hooks\useStripePayment.native.ts",
    "c:\Users\bedel\OneDrive\Desktop\Olvon\mobile-app\hooks\useStripePayment.web.ts",
    "c:\Users\bedel\OneDrive\Desktop\Olvon\mobile-app\components\StripeProviderWrapper.web.tsx",
    "c:\Users\bedel\OneDrive\Desktop\Olvon\mobile-app\components\StripeProviderWrapper.native.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "Deleted $file"
    } else {
        Write-Host "File not found: $file"
    }
}

$dir = "c:\Users\bedel\OneDrive\Desktop\Olvon\mobile-app\backend\supabase\functions\create-payment-intent"
if (Test-Path $dir) {
    Remove-Item -Path $dir -Recurse -Force
    Write-Host "Deleted $dir"
} else {
    Write-Host "Directory not found: $dir"
}
