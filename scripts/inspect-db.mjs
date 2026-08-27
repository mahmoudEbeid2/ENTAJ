import mysql from 'mysql2/promise';

async function inspect() {
  const conn = await mysql.createConnection('mysql://entaj:entaj_dev_pw@localhost:3306/entaj');
  const [tables] = await conn.query('SHOW TABLES');
  console.log('=== DATABASE TABLES & ROW COUNTS ===');
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    const [c] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
    console.log(`${tableName}: ${c[0].cnt} rows`);
  }
  
  console.log('\n=== DIVISIONS ===');
  const [divs] = await conn.query('SELECT * FROM divisions');
  console.log(JSON.stringify(divs, null, 2));

  console.log('\n=== DIVISION SPEC ROWS (count) ===');
  const [specRows] = await conn.query('SELECT division_id, count(*) as cnt FROM division_spec_rows GROUP BY division_id');
  console.log(JSON.stringify(specRows, null, 2));

  console.log('\n=== PRODUCTS (count by division) ===');
  const [prods] = await conn.query('SELECT division_id, count(*) as cnt FROM products GROUP BY division_id');
  console.log(JSON.stringify(prods, null, 2));

  await conn.end();
}

inspect().catch(console.error);
