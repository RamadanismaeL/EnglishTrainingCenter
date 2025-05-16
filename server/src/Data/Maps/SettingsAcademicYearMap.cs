/*
*@ author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class SettingsAcademicYearMap : IEntityTypeConfiguration<SettingsAcademicYearModel>
    {
        public void Configure(EntityTypeBuilder<SettingsAcademicYearModel> builder)
        {
            builder.ToTable("tbSettingsAcademicYear");

            builder.Property(s => s.Id)
                .HasColumnName("Id")
                .HasColumnType("int unsigned")
                .ValueGeneratedOnAdd()
                .IsRequired();
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Day)
                .HasColumnName("Day")
                .HasColumnType("int")
                .IsRequired();

            builder.Property(s => s.Month)
                .HasColumnName("Month")
                .HasColumnType("varchar(50)")
                .IsRequired();            

            builder.Property(s => s.Year)
                .HasColumnName("Year")
                .HasColumnType("int")
                .IsRequired();
        }
    }
}