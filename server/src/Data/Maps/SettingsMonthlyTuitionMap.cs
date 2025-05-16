/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class SettingsMonthlyTuitionMap : IEntityTypeConfiguration<SettingsMonthlyTuitionModel>
    {
        public void Configure(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<SettingsMonthlyTuitionModel> builder)
        {
            builder.ToTable("tbSettingsMonthlyTuition");

            builder.Property(s => s.Id)
                .HasColumnName("Id")
                .HasColumnType("varchar(50)")
                .IsRequired();
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Intensive)
                .HasColumnName("Intensive")
                .HasColumnType("decimal(10,2)");

            builder.Property(s => s.Private)
                .HasColumnName("Private")
                .HasColumnType("decimal(10,2)");

            builder.Property(s => s.Regular)
                .HasColumnName("Regular")
                .HasColumnType("decimal(10,2)");
        }
    }
}