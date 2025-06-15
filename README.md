# AquaFlow

# TBSA - Sistema de Gestiune a Consumului de Apă

**The Building Societies Association - Aplicație de Management pentru Asociațiile de Proprietari**

## 📋 Descrierea Proiectului

TBSA este o aplicație web modernă pentru gestionarea consumului de apă în cadrul asociațiilor de proprietari. Sistemul facilitează colectarea, validarea și administrarea citirilor lunare de apă, oferind o soluție digitală completă pentru gestionarea eficientă a utilităților în clădirile rezidențiale.

## 🎯 Obiectivele Aplicației

### Pentru Administratori

- **Gestionarea multiplelor clădiri** - administrează mai multe asociații de proprietari dintr-un singur cont
- **Setarea termenelor limită** - configurează deadline-uri flexibile pentru submiterea citirilor lunare
- **Validarea citirilor** - verifică și aprobă citirile trimise de proprietari
- **Rapoarte și statistici** - vizualizează consumption trends și genereză rapoarte detaliate
- **Managementul utilizatorilor** - administrează conturile proprietarilor și apartamentele

### Pentru Proprietari

- **Trimiterea citirilor** - submitere rapidă și intuitivă a citirilor lunare de apă
- **Istoric complet** - vizualizează toate citirile anterioare cu detalii de consum
- **Notificări** - primește reminder-e pentru termenele limită de submitere
- **Management apartamente** - gestionează mai multe apartamente deținute
- **Tracking status** - monitorizează statusul validării citirilor de către administrator

## 🏗️ Arhitectura Tehnică

### Stack Tehnologic

- **Frontend**: Next.js 15 cu App Router și TypeScript
- **UI Components**: Shadcn/ui cu Tailwind CSS pentru design modern
- **Database**: PostgreSQL cu Prisma ORM (hosted pe NeonDB)
- **Authentication**: Sistem custom cu bcryptjs (NextAuth.js în plan)
- **Testing**: Jest cu TypeScript și 100% code coverage
- **Validation**: Zod pentru validarea robustă a datelor

### Modelul de Date

- **Users**: Sistem de utilizatori cu roluri (ADMINISTRATOR/OWNER)
- **Buildings**: Clădiri cu apartamente și configurări personalizabile
- **Apartments**: Apartamente cu multiple proprietari posibili
- **Water Readings**: Citiri cu tracking temporal și validare admin
- **Relationships**: Foreign keys și constraints pentru integritatea datelor

## 🧪 Testare și Calitate

- **54 de teste** acoperind toate modulele aplicației
- **100% code coverage** pe toate metrici (statements, branches, functions, lines)
- **Validări Zod** pentru toate input-urile utilizatorilor
- **Securitate** cu hash-uire bcrypt și validări stricte de parole
- **Type Safety** complet cu TypeScript

## 🚀 Status Curent

✅ **Completat:**

- Arhitectura bazei de date cu Prisma
- Sistem de validări cu Zod
- Utilități de autentificare cu bcrypt
- Infrastructură de testare completă (100% coverage)
- Seed data pentru development
- Theme toggle cu shadcn/ui

🔄 **În Dezvoltare:**

- API endpoints pentru operațiile CRUD
- Sistem de autentificare cu NextAuth.js
- Interface utilizator pentru administratori și proprietari
- Dashboard-uri cu statistici și rapoarte

## 🎨 Design și UX

Aplicația folosește un design modern și intuitiv bazat pe:

- **Shadcn/ui components** pentru consistență vizuală
- **Dark/Light theme toggle** pentru confortul utilizatorilor
- **Responsive design** optimizat pentru desktop și mobile
- **Intuitive navigation** adaptat pentru fiecare tip de utilizator
- **Clean interface** focusat pe productivitate și ușurință în utilizare

## 🌟 Beneficii

- **Digitalizarea proceselor** - eliminarea formularelor pe hârtie
- **Transparență completă** - tracking-ul în timp real al tuturor citirilor
- **Eficiență administrativă** - automatizarea validărilor și rapoartelor
- **Accesibilitate** - disponibilitate 24/7 pentru proprietari
- **Scalabilitate** - suport pentru multiple clădiri și mii de apartamente

---

*Dezvoltat cu ❤️ pentru modernizarea gestionării associațiilor de proprietari*
