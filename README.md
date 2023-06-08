# Anonymization Service

Этот проект представляет собой сервис, который анонимизирует и копирует данные покупателей из одной MongoDB коллекции в другую.

## Структура БД

1. `customers` - где создаются исходные данные о покупателях.
2. `customers_anonymized` - куда копируются анонимизированные данные.

**Примечание:** Наш сервис использует функцию прослушивания изменений MongoDB, которая требует, чтобы база данных была настроена как replica set, даже если в ней будет только один инстанс MongoDB.

## Установка

```bash
git clone https://github.com/FiNEk/customer-anonymiser
cd customer-anonymiser
npm install
```

Для работы приложения в окружении должна быть указана переменная `DB_URI`.

Можно создать `.env` файл.

```bash
echo 'DB_URI="mongodb://localhost:27017?directConnection=true"' >> .env
```

Или, можно прописать переменную в текущее окружение.

```bash
export DB_URI="mongodb://localhost:27017?directConnection=true"
```

## Запуск

### Генерация покупателей

```bash
npm run start:app
```

### Риалтайм анонимизация

```bash
npm run start:sync
```

### Полная переидексация

```bash
npm run start:sync -- --full-reindex
```

## Требования

- Node.js >= v19.3 (Скорее всего подойдет что-нибудь поменьше, я не проверял)
- MongoDB **(Replica Set)** >= v4.4
