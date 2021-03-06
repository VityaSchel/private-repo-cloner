# Private Repo Cloner

Эта утилита поможет вам спастись от проклятых американцев, угнетающих русский народ за действия лысого гнома.

## Как использовать?

Вам понадобится аккаунт в Яндекс.Диске (не волнуйтесь, все загружаемые данные зашифрованы) и персональный токен GitHub.

Обратите внимание, что эта программа загружает только приватные репозитории и только те, которыми вы владеете (игнорирует совместный доступ и организации), поддерживает репозитории с несколькими ветками.

1. Клонируйте репозиторий

```
git clone https://github.com/VityaSchel/private-repo-cloner
```

и установите зависимости

```
npm i
```

2. Создайте ключ шифрования

```
node keygen.js
```

Скопируйте ключ в безопасное место!

3. По желанию, добавьте исключения в файл exceptions.txt где надо прописать полное имя репозитория (в формате username/reponame) по одному на строку

4. Запустите основной скрипт

```
npm start
```

По-умолчанию он скопирует только те репозитории, которые изменились с момента последнего запуска, но вы также можете добавить аргумент --full, чтобы получить полный бекап:

```
npm start -- --full
```

5. Следуйте инструкциям для создания токенов Яндекс.Диска и GitHub

6. Дождитесь конца загрузки. По непонятным причинам, у меня скорость колеблется от 200 кБ / секунду до 1 мБ / секунду, но возможно это мой интернет. В любом случае, тормозит Яндекс, а не AES. На Яндексе ваши файлы будут храниться в папке Приложения/GitHub cloner/\[дата\]

Для шифрования используется ключ AES размером 32 байта (256 бит) с паролем и солью размером 4096 байт, генерирующимися с помощью модуля crypto. Ключ хранится в файле AES_scrypt.key, не потеряйте его! Для дешифрования используется скрипт decrypt.js:

```
node decrypt.js [путь к папке с файлами *.tar.gz.encrypted]
```

Создастся подпапка decrypted, в которой будут храниться расшифрованные архивы tar.gz. Скорость дешифрования на моем макбуке: ~18 мБ/секунду.

Не забывайте про ограничения Яндекса: не более 10 гб на файл и у каждого пользователя ограничено место, **ошибки загрузки не обрабатываются утилитой**.

## Contributing

Нашли как ускорить процесс загрузки? Умеете работать с многопоточным NodeJS? Хотите улучшить интерфейс CLI-версии?? Ну тогда просто сделайте форк и не тревожьте меня пожалуйста.

## Funding

[hloth.dev/donate](https://hloth.dev/donate)

## License

На правах Крыма