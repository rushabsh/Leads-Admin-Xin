Add-Type -AssemblyName System.IO.Compression.FileSystem
Get-ChildItem -Path utils -Filter *.docx | ForEach-Object {
    Write-Host "================== $($_.Name) =================="
    $zip = [System.IO.Compression.ZipFile]::OpenRead($_.FullName)
    $entry = $zip.GetEntry('word/document.xml')
    if ($entry) {
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xmlText = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        $clean = [regex]::Replace($xmlText, '<[^>]+>', "`n")
        $lines = $clean -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_.Length -gt 0 }
        $lines -join "`n"
    }
    $zip.Dispose()
}
