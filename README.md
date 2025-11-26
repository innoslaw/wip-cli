# wip-cli

CLI-утилита для работы с WIP-коммитами и git-bundle. Позволяет экспортировать текущую работу в bundle, отправлять его в Telegram, импортировать обратно и управлять WIP-коммитами.

## Установка

```bash
npm install
npm run build
```

Для глобальной установки:

```bash
npm link
```

## Конфигурация

Создайте файл `.wiprc` в домашней директории пользователя (`~/.wiprc`).

### Параметры конфигурации

- `bundle_dir` — каталог хранения бандла (по умолчанию `.git/.wip/`)
- `bundle_name` — имя файла бандла (по умолчанию `wip.bundle`)
- `base_branch` — базовая ветка для работы (по умолчанию `main`)
- `telegram_bot_token` — токен Telegram бота для отправки бандлов
- `telegram_chat_id` — ID чата для отправки бандлов

### Пример `.wiprc`

```
bundle_dir=.git/.wip
bundle_name=wip.bundle
base_branch=main
telegram_bot_token=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
telegram_chat_id=-1001234567890
```

## Команды

### `wip export [--msg <message>]`

Создает WIP-коммит, bundle текущей ветки и отправляет его в Telegram.

**Логика работы:**

1. Определяет репозиторий и текущую ветку
2. Если последний коммит — WIP, удаляет его (`git reset --soft HEAD~1`)
3. Добавляет все изменения (`git add .`)
4. Создает WIP-коммит (`git commit -m "WIP"`)
5. Создает bundle только текущей ветки (`git bundle create <bundle_path> HEAD`)
6. Отправляет bundle в Telegram (если настроено)
7. Выводит путь к bundle

**Пример:**

```bash
wip export
wip export --msg "Work in progress: feature X"
```

### `wip import [bundle-path]`

Импортирует bundle, создает или перезаписывает локальную WIP-ветку, показывает незакоммиченные изменения.

**Логика работы:**

1. Определяет путь к bundle:
   - Если указан аргумент — использует его
   - Иначе `bundle_dir/bundle_name` из конфигурации
2. Проверяет bundle (`git bundle verify`)
3. Обновляет базовую ветку (`git pull origin <base_branch>`)
4. Определяет рабочую ветку:
   - Текущая ветка, если она не базовая
   - Иначе `wip`
5. Если ветка существует — перезаписывает её из базовой
6. Если нет — создает из bundle (`git fetch <bundle_path> HEAD:<branch>`)
7. Переключается на рабочую ветку
8. Если первый коммит — WIP, удаляет его (`git reset --soft HEAD~1`)
9. Выводит список измененных файлов

**Пример:**

```bash
wip import
wip import /path/to/custom.bundle
```

### `wip clean`

Удаляет WIP-коммит после ревью, оставляя изменения незакоммиченными.

**Логика работы:**

1. Проверяет текущую ветку
2. Если последний коммит — WIP, удаляет его (`git reset --soft HEAD~1`)
3. Выводит статус (`git status`)

Если последний коммит не WIP — выдает ошибку.

**Пример:**

```bash
wip clean
```

## Поведение веток

- Автор работает в feature-ветке
- Экспорт создает WIP-коммит и bundle этой же ветки
- Импорт создает или перезаписывает локальную временную ветку из bundle
- Все изменения всегда остаются незакоммиченными для ревью

## Импорт и перекрытие

- Старое состояние ветки при импорте не сохраняется
- Новый bundle всегда заменяет ветку
- Цель: отсутствие «следов» временной работы

## Требования

- Git репозиторий
- Node.js
- Для отправки в Telegram: настроенные `telegram_bot_token` и `telegram_chat_id`

## Разработка

```bash
# Сборка
npm run build

# Разработка с watch
npm run dev

# Запуск
npm start
```

## Структура проекта

```
src/
├── commands/      # Команды CLI (export, import, clean)
├── config/        # Чтение конфигурации из ~/.wiprc
├── logger/        # Логгер
├── types/         # TypeScript типы
├── utils/         # Утилиты (git, telegram)
└── index.ts       # Точка входа с commander.js
```

