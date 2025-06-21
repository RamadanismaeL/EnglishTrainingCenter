/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class FinancialExpenseMap : IEntityTypeConfiguration<FinancialExpenseModel>
    {
        public void Configure(EntityTypeBuilder<FinancialExpenseModel> builder)
        {
            builder.ToTable("tbFinancialExpense");

            builder.Property(u => u.Id)
                .HasColumnName("Id")
                .HasColumnType("bigint unsigned")
                .ValueGeneratedOnAdd()
                .IsRequired();
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Description)
                .HasColumnName("Description")
                .HasColumnType("varchar(500)")
                .IsRequired();

            builder.Property(u => u.Method)
                .HasColumnName("Method")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.AmountMT)
                .HasColumnName("AmountMT")
                .HasColumnType("decimal(10,2)")
                .IsRequired();

            builder.Property(u => u.LastUpdate)
                .HasColumnName("LastUpdate")
                .HasColumnType("datetime");

            builder.Property(u => u.Status)
                .HasColumnName("Status")
                .HasColumnType("varchar(50)")
                .IsRequired();            
        }
    }
}