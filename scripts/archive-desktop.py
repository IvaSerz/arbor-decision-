from pathlib import Path
import subprocess, hashlib
root=Path(__file__).resolve().parents[1]
release=root/'release'
notes={
'Arbor-win32-x64':('Arbor-Windows-x64.zip','WINDOWS 10/11 x64\nРаспакуйте архив полностью и запустите Arbor.exe. Не переносите EXE отдельно от соседних файлов. Установка зависимостей и интернет не нужны. Приложение не подписано; Windows может предупредить о неизвестном издателе. Запуск на Windows пока не проверен.\n'),
'Arbor-darwin-arm64':('Arbor-macOS-AppleSilicon.zip','macOS APPLE SILICON (M1 и новее)\nРаспакуйте архив и откройте Arbor.app. Установка зависимостей и интернет не нужны. Это сборка без подписи разработчика и нотариализации Apple; macOS может заблокировать открытие. Для обычного распространения требуется подписанная сборка на macOS. Запуск на macOS пока не проверен.\n'),
'Arbor-darwin-x64':('Arbor-macOS-Intel.zip','macOS INTEL\nРаспакуйте архив и откройте Arbor.app. Установка зависимостей и интернет не нужны. Это сборка без подписи разработчика и нотариализации Apple; macOS может заблокировать открытие. Для обычного распространения требуется подписанная сборка на macOS. Запуск на macOS пока не проверен.\n')}
checks=[]
for folder,(archive,note) in notes.items():
    (release/folder/'START.txt').write_text('ARBOR 0.1 — ПРОТОТИП\n\n'+note+'\nДанные примера учебные. Для переноса задачи используйте «Сохранить проект» и «Открыть». Автосохранение находится в профиле пользователя ОС. PDF доступен в меню «Файл → Сохранить отчёт в PDF».\n',encoding='utf-8')
    target=release/archive
    target.unlink(missing_ok=True)
    subprocess.run(['zip','-q','-r','-y',str(target),folder],cwd=release,check=True)
    checks.append(hashlib.file_digest(target.open('rb'),'sha256').hexdigest()+'  '+archive)
(release/'SHA256SUMS.txt').write_text('\n'.join(checks)+'\n')
print('\n'.join(checks))
