exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.uuid('id').primary();
    table.decimal('amount', 10, 2).notNullable();
    table.string('category').notNullable();
    table.string('description').notNullable();
    table.enum('type', ['income', 'expense', 'refund']).notNullable();
    table.enum('status', ['completed', 'refunded']).defaultTo('completed');
    table.bigInteger('date').notNullable();
    table.timestamps(true, true);

    // Add indexes for common queries
    table.index(['date']);
    table.index(['category']);
    table.index(['type']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
};
