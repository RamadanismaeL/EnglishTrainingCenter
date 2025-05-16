/*
*@ author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class SettingsAmountMtMap : IEntityTypeConfiguration<SettingsAmountMtModel>
    {
        public void Configure(EntityTypeBuilder<SettingsAmountMtModel> builder)
        {
            builder.ToTable("tbSettingsAmountMt");

            builder.Property(s => s.Id)
                .HasColumnName("Id")
                .HasColumnType("varchar(50)")
                .IsRequired();
            builder.HasKey(s => s.Id);

            builder.Property(s => s.AmountMT)
                .HasColumnName("AmountMT")
                .HasColumnType("decimal(10,2)")
                .IsRequired();
        }
    }
}