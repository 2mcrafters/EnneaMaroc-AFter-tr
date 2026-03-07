<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'firstName' => 'Admin',
            'lastName' => 'User',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin'),
            'role' => 'admin',
            'city' => 'Rabat',
            'phone' => '+212600000000',
            'profilePicture' => 'https://i.pravatar.cc/150?u=admin',
        ]);

        // Employee user
        User::create([
            'firstName' => 'Emily',
            'lastName' => 'Employee',
            'email' => 'emily@example.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'city' => 'Casablanca',
            'phone' => '+212600000001',
            'profilePicture' => 'https://i.pravatar.cc/150?u=emily',
        ]);

        // Professor user
        User::create([
            'firstName' => 'Evelyn',
            'lastName' => 'Reed',
            'email' => 'evelyn.reed@example.com',
            'password' => Hash::make('password'),
            'role' => 'prof',
            'city' => 'Marrakech',
            'phone' => '+212600000002',
            'profilePicture' => 'https://i.pravatar.cc/150?u=evelyn',
            'dob' => '1985-03-15',
        ]);

        // Test student users (optional for testing)
        User::create([
            'firstName' => 'Student',
            'lastName' => 'Demo',
            'email' => 'student@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'city' => 'Fes',
            'phone' => '+212600000003',
            'profilePicture' => 'https://i.pravatar.cc/150?u=student',
            'dob' => '2000-01-01',
        ]);
    }
}
