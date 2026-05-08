# API REST — Express.js Guide

Simple REST API built with **Node.js**, **Express**, and **Prisma**.

---

## Installation

Install the project dependencies:

```bash
npm install
```

---

## Environment Setup

Create your `.env` file based on the example file:

```bash
cp .env.example .env
```

> Update the variables inside `.env` as needed for your environment.

---

## Prisma Setup

Generate the Prisma Client:

```bash
npx prisma generate
```

Run the database migrations:

```bash
npx prisma migrate dev
```

---

## Running the Application

Start the development server:

```bash
npm run dev
```
